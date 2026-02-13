module suipatron::registry;

use std::string::String;
use sui::table::{Self, Table};
use sui::event;

const ECreatorExists: u64 = 0;

// Workaround to don't use indexer
public struct Registry has key {
    id: UID,
    by_addr: Table<address, ID>,
    by_name: Table<String, ID>,
    total: u64,
}

public struct CreatorRegistered has copy, drop {  // public for indexers
    profile_id: ID,
    owner: address,
    name: String,
}

fun init(ctx: &mut TxContext) {
    transfer::share_object(Registry {
        id: object::new(ctx),
        by_addr: table::new(ctx),
        by_name: table::new(ctx),
        total: 0,
    });
}

public(package) fun add(
    reg: &mut Registry,
    owner: address,
    name: String,
    profile_id: ID,
) {
    assert!(!reg.by_addr.contains(owner), ECreatorExists);
    reg.by_addr.add(owner, profile_id);
    reg.by_name.add(name, profile_id);
    reg.total = reg.total + 1;
    event::emit(CreatorRegistered { profile_id, owner, name });
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

#[test_only]
use sui::test_scenario as ts;

#[test]
fun test_add_creator() {
    let mut ts = ts::begin(@0xAA);

    init_for_testing(ts.ctx());

    ts.next_tx(@0xAA);

    let mut registry = ts.take_shared<Registry>();
    let profile_id = object::id_from_address(@0x1);

    add(&mut registry, @0xBB, b"Creator1".to_string(), profile_id);

    assert!(registry.total == 1);
    assert!(registry.by_addr.contains(@0xBB));
    assert!(registry.by_name.contains(b"Creator1".to_string()));

    ts::return_shared(registry);
    ts.end();
}

#[test, expected_failure(abort_code = ECreatorExists)]
fun test_add_creator_twice_fails() {
    let mut ts = ts::begin(@0xAA);

    init_for_testing(ts.ctx());

    ts.next_tx(@0xAA);

    let mut registry = ts.take_shared<Registry>();
    let profile_id = object::id_from_address(@0x1);

    add(&mut registry, @0xBB, b"Creator1".to_string(), profile_id);
    add(&mut registry, @0xBB, b"Creator2".to_string(), profile_id); // Should fail

    ts::return_shared(registry);
    ts.end();
}
