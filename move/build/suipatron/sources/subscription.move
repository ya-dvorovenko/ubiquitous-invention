module suipatron::subscription;

use sui::coin::Coin;
use sui::sui::SUI;
use sui::clock::Clock;
use sui::dynamic_field as df;
use sui::event;
use suipatron::creator::{Self, CreatorProfile};

const EInsufficientPayment: u64 = 0;
const EAlreadySubscribed: u64 = 1;


public struct Subscription has key, store {
    id: UID,
    profile_id: ID,
    expires_at: u64,
    created_at: u64, // With indexer we could remove it
}

public struct Subscribed has copy, drop {
    sub_id: ID,
    profile_id: ID,
    subscriber: address,
    amount: u64,
    expires_at: u64,
}

entry fun subscribe(
    profile: &mut CreatorProfile,
    payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let subscriber = ctx.sender();
    let profile_id = object::id(profile);

    assert!(!df::exists_(creator::profile_uid(profile), subscriber), EAlreadySubscribed);

    let price = creator::price(profile);
    assert!(payment.value() >= price, EInsufficientPayment);

    transfer::public_transfer(payment, creator::owner(profile));

    let now = clock.timestamp_ms();
    let expires = now + 31536000000; // 1 year

    let sub = Subscription {
        id: object::new(ctx),
        profile_id,
        expires_at: expires,
        created_at: now,
    };
    let sub_id = object::id(&sub);

    df::add(creator::profile_uid(profile), subscriber, true);
    creator::inc_subs(profile);

    transfer::transfer(sub, subscriber);

    event::emit(Subscribed { sub_id, profile_id, subscriber, amount: price, expires_at: expires });
}

public(package) fun profile_id(s: &Subscription): ID { s.profile_id }
public(package) fun expires_at(s: &Subscription): u64 { s.expires_at }

#[test_only]
use sui::{test_scenario as ts, clock, coin};
#[test_only]
use suipatron::registry::Registry;

#[test_only]
const ADMIN: address = @0xAA;
#[test_only]
const CREATOR_ADDR: address = @0xBB;
#[test_only]
const SUBSCRIBER: address = @0xCC;

#[test]
fun test_subscribe() {
    let mut ts = ts::begin(ADMIN);

    suipatron::registry::init_for_testing(ts.ctx());
    suipatron::creator::init_for_testing(ts.ctx());

    ts.next_tx(CREATOR_ADDR);

    let mut registry = ts.take_shared<Registry>();
    let publisher = ts.take_from_address<sui::package::Publisher>(ADMIN);
    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        &publisher,
        &mut registry,
        b"Creator".to_string(),
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

    subscribe(&mut profile, payment, &clock, ts.ctx());

    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    assert!(ts.has_most_recent_for_sender<Subscription>());

    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EInsufficientPayment)]
fun test_subscribe_insufficient_payment() {
    let mut ts = ts::begin(ADMIN);

    suipatron::registry::init_for_testing(ts.ctx());
    suipatron::creator::init_for_testing(ts.ctx());

    ts.next_tx(CREATOR_ADDR);

    let mut registry = ts.take_shared<Registry>();
    let publisher = ts.take_from_address<sui::package::Publisher>(ADMIN);
    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        &publisher,
        &mut registry,
        b"Creator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts::return_shared(registry);
    transfer::public_transfer(publisher, ADMIN);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let payment = coin::mint_for_testing<SUI>(500, ts.ctx()); // Not enough

    subscribe(&mut profile, payment, &clock, ts.ctx());

    ts::return_shared(profile);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EAlreadySubscribed)]
fun test_subscribe_twice_fails() {
    let mut ts = ts::begin(ADMIN);

    suipatron::registry::init_for_testing(ts.ctx());
    suipatron::creator::init_for_testing(ts.ctx());

    ts.next_tx(CREATOR_ADDR);

    let mut registry = ts.take_shared<Registry>();
    let publisher = ts.take_from_address<sui::package::Publisher>(ADMIN);
    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        &publisher,
        &mut registry,
        b"Creator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts::return_shared(registry);
    transfer::public_transfer(publisher, ADMIN);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let payment1 = coin::mint_for_testing<SUI>(1000, ts.ctx());
    subscribe(&mut profile, payment1, &clock, ts.ctx());
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let payment2 = coin::mint_for_testing<SUI>(1000, ts.ctx());
    subscribe(&mut profile, payment2, &clock, ts.ctx()); // Should fail

    ts::return_shared(profile);
    clock.destroy_for_testing();
    ts.end();
}
