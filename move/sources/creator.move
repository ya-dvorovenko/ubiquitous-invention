module suipatron::creator;

use std::string::String;
use sui::clock::Clock;
use sui::dynamic_field as df;
use sui::event;

const ENotOwner: u64 = 0;

public struct CREATOR has drop {}

public struct CreatorProfile has key {
    id: UID,
    owner: address,
    name: String,
    bio: String,
    price: u64,
    total_posts: u64,
    total_subs: u64,
    created_at: u64,
}

public struct Post has store, drop {
    post_id: u64,
    title: String,
    preview: String,
    blob_id: String,
    encrypted: bool,
    created_at: u64,
}

public struct PostKey has copy, drop, store { post_id: u64 }

public struct PostPublished has copy, drop {
    profile_id: ID,
    post_id: u64,
    title: String,
    blob_id: String,
}

public struct CreatorRegistered has copy, drop {
    profile_id: ID,
    owner: address,
    name: String,
}

entry fun register(
    name: String,
    bio: String,
    price: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let profile = CreatorProfile {
        id: object::new(ctx),
        owner: ctx.sender(),
        name,
        bio,
        price,
        total_posts: 0,
        total_subs: 0,
        created_at: clock.timestamp_ms(),
    };
    event::emit(CreatorRegistered {
        profile_id: object::id(&profile),
        owner: ctx.sender(),
        name,
    });
    transfer::share_object(profile);
}

entry fun publish_post(
    profile: &mut CreatorProfile,
    title: String,
    preview: String,
    blob_id: String,
    encrypted: bool,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(profile.owner == ctx.sender(), ENotOwner);
    let post_id = profile.total_posts;
    df::add(&mut profile.id, PostKey { post_id }, Post {
        post_id,
        title,
        preview,
        blob_id,
        encrypted,
        created_at: clock.timestamp_ms(),
    });
    profile.total_posts = profile.total_posts + 1;
    event::emit(PostPublished {
        profile_id: object::id(profile),
        post_id,
        title,
        blob_id,
    });
}

public(package) fun price(p: &CreatorProfile): u64 { p.price }
public(package) fun owner(p: &CreatorProfile): address { p.owner }
public(package) fun inc_subs(p: &mut CreatorProfile) { p.total_subs = p.total_subs + 1; }
public(package) fun profile_uid(p: &mut CreatorProfile): &mut UID { &mut p.id }
public(package) fun profile_uid_ref(p: &CreatorProfile): &UID { &p.id }

public fun has_post(p: &CreatorProfile, post_id: u64): bool {
    df::exists_(&p.id, PostKey { post_id })
}

#[test_only]
use sui::{test_scenario as ts, clock};

#[test_only]
const CREATOR_ADDR: address = @0xBB;

#[test]
fun test_register_and_publish_post() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    register(
        b"TestCreator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let mut profile = ts.take_shared<CreatorProfile>();
    assert!(profile.total_posts == 0);

    publish_post(
        &mut profile,
        b"Post 1".to_string(),
        b"Preview".to_string(),
        b"blob123".to_string(),
        true,
        &clock,
        ts.ctx(),
    );

    assert!(profile.total_posts == 1);
    assert!(df::exists_(&profile.id, PostKey { post_id: 0 }));

    ts::return_shared(profile);
    clock.destroy_for_testing();
    ts.end();
}

#[test]
fun test_has_post() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    register(
        b"TestCreator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts.next_tx(CREATOR_ADDR);

    let mut profile = ts.take_shared<CreatorProfile>();

    assert!(!has_post(&profile, 0));
    assert!(!has_post(&profile, 1));

    publish_post(
        &mut profile,
        b"Post 1".to_string(),
        b"Preview".to_string(),
        b"blob123".to_string(),
        true,
        &clock,
        ts.ctx(),
    );

    assert!(has_post(&profile, 0));
    assert!(!has_post(&profile, 1));

    publish_post(
        &mut profile,
        b"Post 2".to_string(),
        b"Preview 2".to_string(),
        b"blob456".to_string(),
        false,
        &clock,
        ts.ctx(),
    );

    assert!(has_post(&profile, 0));
    assert!(has_post(&profile, 1));
    assert!(!has_post(&profile, 2));

    ts::return_shared(profile);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = ENotOwner)]
fun test_publish_post_not_owner_fails() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    register(
        b"TestCreator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    // Try to post as different user
    ts.next_tx(@0xCC);

    let mut profile = ts.take_shared<CreatorProfile>();

    publish_post(
        &mut profile,
        b"Post 1".to_string(),
        b"Preview".to_string(),
        b"blob123".to_string(),
        true,
        &clock,
        ts.ctx(),
    );

    ts::return_shared(profile);
    clock.destroy_for_testing();
    ts.end();
}
