module suipatron::seal_mock;

use sui::clock::Clock;
use suipatron::subscription::{Self, Subscription};

const EWrongProfile: u64 = 0;
const EExpired: u64 = 1;

/// Mock Seal verification - checks subscription validity
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
use suipatron::{registry::Registry, creator::CreatorProfile};

#[test_only]
const ADMIN: address = @0xAA;
#[test_only]
const CREATOR_ADDR: address = @0xBB;
#[test_only]
const SUBSCRIBER: address = @0xCC;

#[test]
fun test_full_flow() {
    let mut ts = ts::begin(ADMIN);

    // Init registry and creator
    suipatron::registry::init_for_testing(ts.ctx());
    suipatron::creator::init_for_testing(ts.ctx());

    ts.next_tx(CREATOR_ADDR);

    // Register creator
    let mut registry = ts.take_shared<Registry>();
    let publisher = ts.take_from_address<sui::package::Publisher>(ADMIN);
    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        &publisher,
        &mut registry,
        b"TestCreator".to_string(),
        b"Test bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts::return_shared(registry);
    transfer::public_transfer(publisher, ADMIN);

    ts.next_tx(CREATOR_ADDR);

    // Publish post
    let mut profile = ts.take_shared<CreatorProfile>();

    suipatron::creator::publish_post(
        &mut profile,
        b"Post 1".to_string(),
        b"Preview".to_string(),
        b"blob123".to_string(),
        true,
        &clock,
        ts.ctx(),
    );

    let profile_id = object::id(&profile);
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    // Subscribe
    let mut profile = ts.take_shared<CreatorProfile>();
    let payment = coin::mint_for_testing<SUI>(1000, ts.ctx());

    suipatron::subscription::subscribe(&mut profile, payment, &clock, ts.ctx());

    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    // Verify access with seal_mock
    let sub = ts.take_from_sender<Subscription>();
    assert_access(&sub, profile_id, &clock);
    ts.return_to_sender(sub);

    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EWrongProfile)]
fun test_assert_access_wrong_profile() {
    let mut ts = ts::begin(ADMIN);

    // Setup full flow
    suipatron::registry::init_for_testing(ts.ctx());
    suipatron::creator::init_for_testing(ts.ctx());

    ts.next_tx(CREATOR_ADDR);

    let mut registry = ts.take_shared<Registry>();
    let publisher = ts.take_from_address<sui::package::Publisher>(ADMIN);
    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        &publisher,
        &mut registry,
        b"Creator1".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts::return_shared(registry);
    transfer::public_transfer(publisher, ADMIN);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, payment, &clock, ts.ctx());
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();
    let wrong_profile_id = object::id_from_address(@0xDEAD);

    // Should fail - wrong profile
    assert_access(&sub, wrong_profile_id, &clock);

    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EExpired)]
fun test_assert_access_expired() {
    let mut ts = ts::begin(ADMIN);

    suipatron::registry::init_for_testing(ts.ctx());
    suipatron::creator::init_for_testing(ts.ctx());

    ts.next_tx(CREATOR_ADDR);

    let mut registry = ts.take_shared<Registry>();
    let publisher = ts.take_from_address<sui::package::Publisher>(ADMIN);
    let mut clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        &publisher,
        &mut registry,
        b"Creator1".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts::return_shared(registry);
    transfer::public_transfer(publisher, ADMIN);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let profile_id = object::id(&profile);
    let payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    suipatron::subscription::subscribe(&mut profile, payment, &clock, ts.ctx());
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let sub = ts.take_from_sender<Subscription>();

    // Set clock past expiration (1 year + 1 second)
    clock.set_for_testing(31536000001);

    // Should fail - expired
    assert_access(&sub, profile_id, &clock);

    ts.return_to_sender(sub);
    clock.destroy_for_testing();
    ts.end();
}
