module suipatron::subscription;

use sui::coin::Coin;
use sui::sui::SUI;
use sui::clock::Clock;
use sui::dynamic_field as df;
use sui::event;
use sui::package;
use sui::display;
use suipatron::creator::{Self, CreatorProfile};

const EInsufficientPayment: u64 = 0;
const EAlreadySubscribed: u64 = 1;

public struct SUBSCRIPTION has drop {}

public struct Subscription has key, store {
    id: UID,
    profile_id: ID,
    expires_at: u64,
    created_at: u64,
}

public struct Subscribed has copy, drop {
    sub_id: ID,
    profile_id: ID,
    subscriber: address,
    amount: u64,
    expires_at: u64,
}

fun init(otw: SUBSCRIPTION, ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);

    let mut sub_display = display::new<Subscription>(&publisher, ctx);
    sub_display.add(b"name".to_string(), b"SuiPatron Subscription".to_string());
    sub_display.add(b"description".to_string(), b"Active subscription to creator".to_string());
    sub_display.add(b"project_url".to_string(), b"https://suipatron.com".to_string());
    display::update_version(&mut sub_display);
    transfer::public_transfer(sub_display, ctx.sender());

    transfer::public_transfer(publisher, ctx.sender());
}

entry fun subscribe(
    profile: &mut CreatorProfile,
    payment: &mut Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let subscriber = ctx.sender();
    let profile_id = object::id(profile);

    assert!(!df::exists_(creator::profile_uid(profile), subscriber), EAlreadySubscribed);

    let price = creator::price(profile);
    assert!(payment.value() >= price, EInsufficientPayment);

    let paid = payment.split(price, ctx);
    transfer::public_transfer(paid, creator::owner(profile));

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

public fun is_subscribed(p: &CreatorProfile, addr: address): bool {
    df::exists_(creator::profile_uid_ref(p), addr)
}

#[test_only]
use sui::{test_scenario as ts, clock, coin};

#[test_only]
const CREATOR_ADDR: address = @0xBB;
#[test_only]
const SUBSCRIBER: address = @0xCC;

#[test]
fun test_subscribe() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());

    subscribe(&mut profile, &mut payment, &clock, ts.ctx());

    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    assert!(ts.has_most_recent_for_sender<Subscription>());

    clock.destroy_for_testing();
    ts.end();
}

#[test]
fun test_is_subscribed() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts.next_tx(SUBSCRIBER);

    let profile = ts.take_shared<CreatorProfile>();
    assert!(!is_subscribed(&profile, SUBSCRIBER));
    assert!(!is_subscribed(&profile, @0xDD));
    ts::return_shared(profile);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(1000, ts.ctx());
    subscribe(&mut profile, &mut payment, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment);

    ts.next_tx(SUBSCRIBER);

    let profile = ts.take_shared<CreatorProfile>();
    assert!(is_subscribed(&profile, SUBSCRIBER));
    assert!(!is_subscribed(&profile, @0xDD));
    ts::return_shared(profile);

    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EInsufficientPayment)]
fun test_subscribe_insufficient_payment() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment = coin::mint_for_testing<SUI>(500, ts.ctx());

    subscribe(&mut profile, &mut payment, &clock, ts.ctx());

    ts::return_shared(profile);
    coin::burn_for_testing(payment);
    clock.destroy_for_testing();
    ts.end();
}

#[test, expected_failure(abort_code = EAlreadySubscribed)]
fun test_subscribe_twice_fails() {
    let mut ts = ts::begin(CREATOR_ADDR);

    let clock = clock::create_for_testing(ts.ctx());

    suipatron::creator::register(
        b"Creator".to_string(),
        b"Bio".to_string(),
        1000,
        &clock,
        ts.ctx(),
    );

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment1 = coin::mint_for_testing<SUI>(1000, ts.ctx());
    subscribe(&mut profile, &mut payment1, &clock, ts.ctx());
    ts::return_shared(profile);
    coin::burn_for_testing(payment1);

    ts.next_tx(SUBSCRIBER);

    let mut profile = ts.take_shared<CreatorProfile>();
    let mut payment2 = coin::mint_for_testing<SUI>(1000, ts.ctx());
    subscribe(&mut profile, &mut payment2, &clock, ts.ctx());

    ts::return_shared(profile);
    coin::burn_for_testing(payment2);
    clock.destroy_for_testing();
    ts.end();
}
