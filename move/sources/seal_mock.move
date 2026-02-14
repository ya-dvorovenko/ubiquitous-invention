module suipatron::seal_mock;

use sui::clock::Clock;
use suipatron::creator::{CreatorProfile, CreatorCap};
use suipatron::subscription::{Self, Subscription};

const EWrongProfile: u64 = 0;
const EExpired: u64 = 1;
const ENoAccess: u64 = 2;

/// Returns true if `prefix` is a prefix of `word`.
fun is_prefix(prefix: vector<u8>, word: vector<u8>): bool {
    if (prefix.length() > word.length()) {
        return false
    };
    let mut i = 0;
    while (i < prefix.length()) {
        if (prefix[i] != word[i]) {
            return false
        };
        i = i + 1;
    };
    true
}

/// Real Seal integration: entry point called by Seal key servers when user requests decryption.
/// Key format: id = [profile.id.to_bytes()][nonce] — same format used when encrypting.
/// Policy: subscription must be for this profile and not expired.
entry fun seal_approve(
    id: vector<u8>,
    sub: &Subscription,
    profile: &CreatorProfile,
    clock: &Clock,
) {
    assert!(subscription::profile_id(sub) == object::id(profile), EWrongProfile);
    assert!(subscription::expires_at(sub) >= clock.timestamp_ms(), EExpired);
    assert!(is_prefix(object::id(profile).to_bytes(), id), ENoAccess);
}

/// Mock Seal verification - checks subscription validity (legacy / testing)
entry fun assert_access(
    sub: &Subscription,
    target_profile_id: ID,
    clock: &Clock,
) {
    assert!(subscription::profile_id(sub) == target_profile_id, EWrongProfile);
    assert!(subscription::expires_at(sub) >= clock.timestamp_ms(), EExpired);
}

#[test_only]
use sui::{test_scenario as ts, clock, coin, sui::SUI};

#[test_only]
const CREATOR_ADDR: address = @0xBB;
#[test_only]
const SUBSCRIBER: address = @0xCC;

#[test]
fun test_full_flow() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"TestCreator".to_string(),
        b"Test bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap = ts.take_from_sender<CreatorCap>();
    let mut profile = ts.take_shared<CreatorProfile>();

    // Add a tier
    suipatron::creator::add_tier(&cap, &mut profile, 31536000000, 1000);

    suipatron::creator::publish_post(
        &cap,
        &mut profile,
        b"Post 1".to_string(),
        b"Preview".to_string(),
        b"blob123".to_string(),
        true,
        &clock,
    );

    let profile_id = object::id(&profile);
    ts.return_to_sender(cap);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());

    suipatron::subscription::subscribe(&mut profile, 0, &mut payment, &clock, ts.ctx());

    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    assert_access(&sub, profile_id, &clock);
    ts.return_to_sender(sub);

    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EWrongProfile)]
fun test_assert_access_wrong_profile() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator1".to_string(),
        b"Bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap = ts.take_from_sender<CreatorCap>();
    let mut profile = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap, &mut profile, 31536000000, 1000);
    ts.return_to_sender(cap);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, 0, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    let wrong_profile_id = object::id_from_address(@0xDEAD);

    assert_access(&sub, wrong_profile_id, &clock);

    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EExpired)]
fun test_assert_access_expired() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let mut clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator1".to_string(),
        b"Bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap = ts.take_from_sender<CreatorCap>();
    let mut profile = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap, &mut profile, 31536000000, 1000);
    ts.return_to_sender(cap);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let profile_id = object::id(&profile);
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, 0, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();

    clock.set_for_testing(31536000001);

    assert_access(&sub, profile_id, &clock);

    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}

// --- seal_approve tests (real Seal integration) ---

#[test]
fun test_seal_approve_success() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator1".to_string(),
        b"Bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap = ts.take_from_sender<CreatorCap>();
    let mut profile = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap, &mut profile, 31536000000, 1000);
    let profile_id = object::id(&profile);
    ts.return_to_sender(cap);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, 0, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    let profile = ts.take_shared<CreatorProfile>();

    let mut id = profile_id.to_bytes();
    id.push_back(1);
    id.push_back(2);
    id.push_back(3);

    seal_approve(id, &sub, &profile, &clock);

    ts::return_shared(profile);
    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EWrongProfile)]
fun test_seal_approve_wrong_profile() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator1".to_string(),
        b"Bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap1 = ts.take_from_sender<CreatorCap>();
    let mut profile1 = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap1, &mut profile1, 31536000000, 1000);
    ts.return_to_sender(cap1);
    ts::return_shared(profile1);

    ts.next_tx(@0xDD);

    suipatron::creator::register(
        b"Creator2".to_string(),
        b"Bio2".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(@0xDD);

    let cap2 = ts.take_from_sender<CreatorCap>();
    let mut profile2 = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap2, &mut profile2, 31536000000, 500);
    ts.return_to_sender(cap2);
    ts::return_shared(profile2);

    ts.next_tx(SUBSCRIBER);

    let mut profile1 = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile1, 0, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile1);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    let _profile1 = ts.take_shared<CreatorProfile>();
    ts::return_shared(_profile1);
    let profile2 = ts.take_shared<CreatorProfile>();

    let mut id = object::id(&profile2).to_bytes();
    id.push_back(1);

    seal_approve(id, &sub, &profile2, &clock);

    ts::return_shared(profile2);
    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EExpired)]
fun test_seal_approve_expired() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let mut clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator1".to_string(),
        b"Bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap = ts.take_from_sender<CreatorCap>();
    let mut profile = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap, &mut profile, 31536000000, 1000);
    let profile_id = object::id(&profile);
    ts.return_to_sender(cap);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, 0, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    let profile = ts.take_shared<CreatorProfile>();

    clock.set_for_testing(31536000001);

    let mut id = profile_id.to_bytes();
    id.push_back(1);

    seal_approve(id, &sub, &profile, &clock);

    ts::return_shared(profile);
    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = ENoAccess)]
fun test_seal_approve_wrong_id_prefix() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator1".to_string(),
        b"Bio".to_string(),
        b"".to_string(),
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let cap = ts.take_from_sender<CreatorCap>();
    let mut profile = ts.take_shared<CreatorProfile>();
    suipatron::creator::add_tier(&cap, &mut profile, 31536000000, 1000);
    ts.return_to_sender(cap);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, 0, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    let profile = ts.take_shared<CreatorProfile>();

    let wrong_prefix = vector[0, 1, 2, 3, 4, 5];

    seal_approve(wrong_prefix, &sub, &profile, &clock);

    ts::return_shared(profile);
    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}
