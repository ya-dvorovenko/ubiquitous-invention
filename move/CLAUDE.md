# Sui Move Bootcamp & Hackathon Guide

> **Team Size**: 3-4 people | **Focus**: Sui blockchain development with Move language

## Quick Reference - Critical Patterns

### The Four Abilities (MUST MEMORIZE)

| Ability | Purpose | Use Cases |
|---------|---------|-----------|
| **key** | Makes struct an object (REQUIRES `id: UID` first field) | NFTs, game items, shared objects |
| **store** | Can be stored in other structs/transferred | Composable assets, nested objects |
| **drop** | Can be discarded/ignored | Events, temporary values, witnesses |
| **copy** | Can be duplicated (not moved) | Primitive-like values, event data |

```move
// Common combinations:
public struct NFT has key, store { id: UID, ... }        // Transferable asset
public struct Event has copy, drop { ... }                // Emittable event
public struct AdminCap has key { id: UID }                // Capability (non-transferable)
public struct HotPotato { ... }                           // NO abilities = must be consumed
public struct OTW has drop {}                             // One-time witness
```

---

## Critical Design Patterns

### 1. One-Time Witness (OTW) Pattern

**Purpose**: Prove module authority, create unique resources (coins, Publisher)

```move
module my_package::my_module;

// OTW struct: MUST be named after MODULE in CAPS, MUST have only `drop`
public struct MY_MODULE has drop {}

fun init(otw: MY_MODULE, ctx: &mut TxContext) {
    // otw is passed ONLY ONCE during package publication
    package::claim_and_keep(otw, ctx);  // Creates Publisher object
}
```

**Key Rules**:
- Name MUST match module name in UPPERCASE
- ONLY has `drop` ability
- Received ONLY in `init` function
- Used for: Creating coins, claiming Publisher, proving module ownership

**Bootcamp Example**: [C1/publisher/sources/hero.move](bootcamp_solution/C1/publisher/sources/hero.move)

---

### 2. Capability Pattern

**Purpose**: Object-based access control - whoever owns the Cap has permissions

```move
public struct AdminCap has key {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
}

// Requires AdminCap reference to call
public fun protected_action(_: &AdminCap, ...) { ... }

// AdminCap holder can create more admins
public fun new_admin(_: &AdminCap, to: address, ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, to);
}
```

**Naming**: Always suffix with `Cap` (e.g., `AdminCap`, `MintCap`, `TreasuryCap`)

**Bootcamp Example**: [C1/capability/sources/hero.move](bootcamp_solution/C1/capability/sources/hero.move)

---

### 3. Witness Pattern

**Purpose**: Type-level access control across modules using Move's type system

```move
// Module A: Defines witness and protected function
module weapon::weapon;

public struct AllowList has key {
    id: UID,
    witness_types: Table<String, bool>,
}

public fun mint_weapon<W: drop>(_: W, allow_list: &AllowList, ctx: &mut TxContext): Weapon {
    let caller_witness = type_name::with_original_ids<W>().into_string();
    assert!(allow_list.witness_types.contains(caller_witness), EInvalidCaller);
    Weapon { id: object::new(ctx), name }
}

// Module B: Creates witness to call protected function
module hero::hero;

public struct HERO_WITNESS has drop {}

public fun attach_weapon(hero: &mut Hero, allow_list: &AllowList, ctx: &mut TxContext) {
    let weapon = weapon::mint_weapon(HERO_WITNESS {}, allow_list, ctx);
    // ... attach to hero
}
```

**Key Concept**: The witness type proves which module is calling

**Bootcamp Example**: [H2/witness_hero/](bootcamp_solution/H2/witness_hero/)

---

### 4. Hot Potato Pattern

**Purpose**: Force sequential execution - struct MUST be consumed (no `drop`)

```move
// NO abilities = cannot be dropped, MUST be consumed
public struct HotPotato {
    payment_approved: bool,
}

public fun borrow_potato(): HotPotato {
    HotPotato { payment_approved: false }
}

public fun process_payment(potato: &mut HotPotato, payment: Coin<SUI>) {
    if (payment.value() >= MIN_PAYMENT) {
        potato.payment_approved = true;
    };
}

// MUST consume the potato by unpacking
public fun mint_hero(potato: HotPotato, ctx: &mut TxContext): Hero {
    let HotPotato { payment_approved } = potato;  // Unpack = consume
    assert!(payment_approved, EInvalidPayment);
    Hero { id: object::new(ctx), name: b"Hero".to_string() }
}
```

**Key Insight**: No `drop` ability = compiler forces you to handle it

**Naming**: Don't put "Potato" in name - lack of abilities is self-documenting

**Bootcamp Example**: [C1/hot_potato/sources/hot_potato.move](bootcamp_solution/C1/hot_potato/sources/hot_potato.move)

---

## Object Ownership & Storage

### Object Ownership Types

| Type | How to Create | Who Can Access | Use Case |
|------|---------------|----------------|----------|
| **Owned** | `transfer::transfer(obj, address)` | Only owner | NFTs, personal assets |
| **Shared** | `transfer::share_object(obj)` | Anyone (with `&mut`) | Game state, registries, pools |
| **Immutable** | `transfer::freeze_object(obj)` | Anyone (read-only) | Config, metadata |
| **Wrapped** | Store inside another object | Parent object owner | Composable assets |

### Shared Objects

**Purpose**: Global state accessible by anyone (requires consensus)

```move
public struct GameRegistry has key {
    id: UID,
    players: Table<address, PlayerData>,
    total_games: u64,
}

fun init(ctx: &mut TxContext) {
    let registry = GameRegistry {
        id: object::new(ctx),
        players: table::new(ctx),
        total_games: 0,
    };
    // Makes object accessible to EVERYONE
    transfer::share_object(registry);
}

// Anyone can call this with &mut reference
public fun register_player(registry: &mut GameRegistry, ctx: &mut TxContext) {
    let player = ctx.sender();
    registry.players.add(player, PlayerData { ... });
}
```

**Important**: Shared objects require consensus = slower than owned objects

**Bootcamp Example**: [B3/abilities_events_params](bootcamp_solution/B3/abilities_events_params/sources/abilities_events_params.move)

---

### Wrapped Objects (Object Composition)

**Purpose**: Store objects inside other objects - child moves with parent

```move
public struct Hero has key {
    id: UID,
    name: String,
    medals: vector<Medal>,  // Wrapped objects stored directly
}

public struct Medal has key, store {  // MUST have `store` to be wrapped
    id: UID,
    name: String,
}

// Medal is wrapped inside Hero - not independently accessible
public fun award_medal(hero: &mut Hero, medal: Medal) {
    hero.medals.push_back(medal);
}
```

**Key Rule**: Wrapped objects MUST have `store` ability

**Bootcamp Example**: [B3/abilities_events_params](bootcamp_solution/B3/abilities_events_params/sources/abilities_events_params.move)

---

### Dynamic Fields vs Dynamic Object Fields

| Feature | Dynamic Field (`df`) | Dynamic Object Field (`dof`) |
|---------|---------------------|------------------------------|
| **Stored Type** | Any type with `store` | Objects with `key + store` |
| **Visibility** | Hidden from explorers | Visible as child object |
| **Use Case** | Primitive data, configs | Nested NFTs, game items |
| **Import** | `sui::dynamic_field` | `sui::dynamic_object_field` |

#### Dynamic Fields (`df`)

```move
use sui::dynamic_field as df;

public struct Hero has key {
    id: UID,
    name: String,
}

// Add arbitrary key-value data to object
public fun set_power(hero: &mut Hero, power: u64) {
    if (df::exists_(&hero.id, b"power")) {
        *df::borrow_mut(&mut hero.id, b"power") = power;
    } else {
        df::add(&mut hero.id, b"power", power);
    };
}

public fun get_power(hero: &Hero): u64 {
    *df::borrow(&hero.id, b"power")
}

// Remove dynamic field
public fun remove_power(hero: &mut Hero): u64 {
    df::remove(&mut hero.id, b"power")
}
```

#### Dynamic Object Fields (`dof`)

```move
use sui::dynamic_object_field as dof;

public struct Hero has key, store {
    id: UID,
    name: String,
}

public struct Weapon has key, store {
    id: UID,
    damage: u64,
}

// Store object as child - visible in explorer
public fun equip_weapon(hero: &mut Hero, weapon: Weapon) {
    dof::add(&mut hero.id, b"weapon", weapon);
}

// Borrow child object
public fun weapon_damage(hero: &Hero): u64 {
    let weapon: &Weapon = dof::borrow(&hero.id, b"weapon");
    weapon.damage
}

// Remove and return child object
public fun unequip_weapon(hero: &mut Hero): Weapon {
    dof::remove(&mut hero.id, b"weapon")
}
```

**Bootcamp Example**: [G3/df_hero](bootcamp_solution/G3/df_hero/sources/df_hero.move) and [G3/dof_hero](bootcamp_solution/G3/df_hero/sources/dof_hero.move)

---

## Collections & Data Structures

### Comparison Table

| Collection | Key Type | Value Type | Use Case |
|------------|----------|------------|----------|
| **vector** | Index (u64) | Any with `drop` or manual handling | Small lists, known size |
| **Table** | Any `copy+drop+store` | Any `store` | Large key-value maps |
| **VecMap** | Any `copy` | Any | Small maps, iteration needed |
| **Bag** | Any `copy+drop+store` | Heterogeneous | Mixed types, type-safe keys |
| **ObjectTable** | Any `copy+drop+store` | Objects (`key+store`) | Storing objects by key |
| **ObjectBag** | Any `copy+drop+store` | Objects (`key+store`) | Mixed object types |

### Vector

```move
// Literal syntax
let v = vector[1, 2, 3];

// Index access
let first = v[0];

// Common operations
v.push_back(4);
let last = v.pop_back();
let len = v.length();
let is_empty = v.is_empty();

// Iteration with macros
v.do_ref!(|e| process(e));
let doubled = v.map!(|e| e * 2);
let sum = v.fold!(0, |acc, e| acc + e);
```

### Table (Large Collections)

```move
use sui::table::{Self, Table};

public struct HeroRegistry has key {
    id: UID,
    heroes: Table<address, HeroData>,  // Unlimited size
}

fun init(ctx: &mut TxContext) {
    let registry = HeroRegistry {
        id: object::new(ctx),
        heroes: table::new(ctx),  // Requires ctx
    };
    transfer::share_object(registry);
}

public fun register(registry: &mut HeroRegistry, data: HeroData, ctx: &TxContext) {
    registry.heroes.add(ctx.sender(), data);
}

public fun get_hero(registry: &HeroRegistry, addr: address): &HeroData {
    registry.heroes.borrow(addr)
}

public fun update_hero(registry: &mut HeroRegistry, addr: address): &mut HeroData {
    registry.heroes.borrow_mut(addr)
}

public fun remove_hero(registry: &mut HeroRegistry, addr: address): HeroData {
    registry.heroes.remove(addr)
}
```

**Bootcamp Example**: [G3/table_hero](bootcamp_solution/G3/table_hero/sources/hero.move)

### VecMap (Small Maps with Iteration)

```move
use sui::vec_map::{Self, VecMap};

public struct HeroRegistry has key {
    id: UID,
    heroes: VecMap<ID, bool>,  // hero_id -> is_alive
}

fun init(ctx: &mut TxContext) {
    let registry = HeroRegistry {
        id: object::new(ctx),
        heroes: vec_map::empty(),  // No ctx needed
    };
    transfer::share_object(registry);
}

// VecMap supports iteration
public fun get_alive_heroes(registry: &HeroRegistry): vector<ID> {
    registry.heroes.keys().filter!(|id| *registry.heroes.get(id))
}
```

**Bootcamp Example**: [G2/vecmap_hero](bootcamp_solution/G2/vecmap_hero/sources/hero.move)

### Bag (Heterogeneous Collection)

```move
use sui::bag::{Self, Bag};

// Type-safe keys using positional structs
public struct FireKey() has copy, drop, store;
public struct WaterKey() has copy, drop, store;

public struct Hero has key {
    id: UID,
    attributes: Bag,  // Can hold different types!
}

public fun create_hero(ctx: &mut TxContext): Hero {
    let mut hero = Hero {
        id: object::new(ctx),
        attributes: bag::new(ctx),
    };

    // Different value types with different keys
    hero.attributes.add(FireKey(), 100u16);   // u16 value
    hero.attributes.add(WaterKey(), 50u16);   // u16 value

    hero
}

public fun get_fire(hero: &Hero): u16 {
    *hero.attributes.borrow<FireKey, u16>(FireKey())
}
```

**Bootcamp Example**: [G2/bag_hero](bootcamp_solution/G2/bag_hero/sources/hero.move)

---

### Events

**Purpose**: Emit data for off-chain indexing/tracking

```move
// Event struct: MUST have copy + drop
public struct HeroMinted has copy, drop {
    hero_id: ID,
    owner: address,
    timestamp: u64,
}

public fun mint_hero(registry: &mut HeroRegistry, ctx: &mut TxContext): Hero {
    let hero = Hero { id: object::new(ctx), ... };

    // Emit event for indexers
    event::emit(HeroMinted {
        hero_id: object::id(&hero),
        owner: ctx.sender(),
        timestamp: 0, // Use clock for real timestamp
    });

    hero
}
```

**Naming**: Use past tense (e.g., `HeroMinted`, `GameStarted`, `TokenTransferred`)

---

## Move 2024 Edition Requirements

### Move.toml Setup

```toml
[package]
name = "my_package"
edition = "2024.beta"  # REQUIRED for modern features

# Sui 1.45+: Framework deps are IMPLICIT - don't list them!
[dependencies]
# NO Sui, MoveStdlib, etc. needed

[addresses]
my_package = "0x0"
```

### Modern Module Syntax

```move
// 2024 Edition - NO curly braces around module
module my_package::my_module;

use std::string::String;

public struct Hero has key {
    id: UID,
    name: String,
}

// ... rest of module (no closing brace)
```

---

## Code Quality Checklist

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Error constants | EPascalCase | `const ENotAuthorized: u64 = 0;` |
| Regular constants | ALL_CAPS | `const MAX_SUPPLY: u64 = 1000;` |
| Capabilities | Suffix with Cap | `AdminCap`, `MintCap` |
| Events | Past tense | `HeroMinted`, `ItemTransferred` |
| Getters | Field name, no `get_` | `public fun name(&self): String` |
| Mutable getters | Field name + `_mut` | `public fun details_mut(&mut self)` |

### Function Best Practices

```move
// GOOD: Use `public` or `entry`, never both
public fun composable_action(): Hero { ... }  // Returns value, PTB-friendly
entry fun final_action(...) { ... }           // Transaction endpoint only

// BAD: Don't use `public entry`
public entry fun bad_practice() { ... }

// Parameter order:
// 1. Objects (mutable first, then immutable)
// 2. Capabilities
// 3. Primitives
// 4. Clock
// 5. TxContext (always last)
public fun proper_order(
    app: &mut App,           // 1. Mutable object
    cap: &AdminCap,          // 2. Capability
    amount: u64,             // 3. Primitive
    clock: &Clock,           // 4. Clock
    ctx: &mut TxContext,     // 5. Context
) { }
```

### Modern Method Syntax (Move 2024)

```move
// GOOD: Use method syntax
ctx.sender()                        // NOT tx_context::sender(ctx)
id.delete()                         // NOT object::delete(id)
payment.split(amount, ctx)          // NOT coin::split(&mut payment, amount, ctx)
b"hello".to_string()                // NOT std::string::utf8(b"hello")
my_vec.length()                     // NOT vector::length(&my_vec)
my_vec[0]                           // NOT *vector::borrow(&my_vec, 0)

// Vector literal
let v = vector[1, 2, 3];            // NOT vector::empty() + push_back
```

### Option and Loop Macros

```move
// Option handling
opt.do!(|value| process(value));           // Conditional execution
let v = opt.destroy_or!(default);          // Unwrap with default
let v = opt.destroy_or!(abort EEmpty);     // Unwrap or abort

// Loop macros
32u8.do!(|_| action());                    // Repeat N times
let v = vector::tabulate!(10, |i| i * 2);  // Create vector from iteration
vec.do_ref!(|e| process(e));               // Iterate by reference
vec.destroy!(|e| consume(e));              // Consume vector
let sum = vec.fold!(0, |acc, v| acc + v);  // Fold/reduce
let filtered = vec.filter!(|e| e > 5);     // Filter (requires T: drop)
```

### Testing Best Practices

```move
// GOOD: Combine test attributes
#[test, expected_failure(abort_code = ENotAuthorized)]
fun unauthorized_access_fails() { ... }

// GOOD: Use assert_eq! for better error messages
assert_eq!(result, expected);

// GOOD: Use destroy for cleanup
use sui::test_utils::destroy;
destroy(object);

// GOOD: Simple tests don't need test_scenario
let ctx = &mut tx_context::dummy();

// Test naming: Don't prefix with test_
#[test]
fun hero_can_level_up() { ... }  // NOT test_hero_can_level_up
```

---

## Bootcamp Module Reference

### Module A: Sui Fundamentals
- A1-A3: Concepts (decentralized ledgers, ecosystem, infrastructure)
- A4: First contract, wallet CLI

### Module B: Move Basics
- B1: Packages, modules, objects, abilities
- B2: Primitives, strings, vectors, dynamic fields
- B3: Events, parameter types, shared objects

### Module C: Advanced Patterns
- **C1**: Capability, OTW/Publisher, Hot Potato patterns
- C2: Object Display
- C3: Programmable Transaction Blocks (PTBs)

### Module D: Client Interactions
- D1-D4: Sui Client, reading objects, pagination, transactions

### Module E-F: DApp Development
- E1-E2: NFT minting, wallet integration
- F1: Full DApp development

### Module G: Advanced Move
- G1: Custom initializers, test_scenario
- G2: Collections (Vector, VecMap, Bag, Option)
- G3: Dynamic Fields, Tables

### Module H: Security
- H1: Package upgrades, versioned objects
- **H2**: Advanced patterns (Capability+Properties, Witness, Display)
- H3-H4: Security concerns, vulnerability patterns

### Module I: Tokens & Marketplaces
- I1-I2: Custom coins, TreasuryCap
- I3: Closed-loop tokens
- I4-I5: Kiosk, transfer policies

### Module J-K: Infrastructure
- J1-J3: Indexers, monitoring (Prometheus/Grafana)
- K1-K4: Advanced backend, full-stack

---

## Hackathon Quick Tips

### Team Role Suggestions (3-4 people)
1. **Move Developer**: Smart contract architecture, patterns
2. **Frontend Developer**: React/TypeScript, Sui SDK integration
3. **Full-Stack/Integration**: PTBs, indexer, backend
4. **Product/Design**: UX, pitch, documentation

### Common Hackathon Patterns

```move
// NFT Collection with minting
public struct NFT has key, store {
    id: UID,
    name: String,
    image_url: Url,
}

public struct MintCap has key {
    id: UID,
    supply: u64,
    max_supply: u64,
}

public fun mint(cap: &mut MintCap, name: String, ctx: &mut TxContext): NFT {
    assert!(cap.supply < cap.max_supply, EMaxSupplyReached);
    cap.supply = cap.supply + 1;
    NFT { id: object::new(ctx), name, image_url: ... }
}
```

```move
// Shared state with events
public struct GameState has key {
    id: UID,
    players: Table<address, PlayerData>,
    round: u64,
}

public struct PlayerJoined has copy, drop {
    player: address,
    round: u64,
}

public fun join_game(state: &mut GameState, ctx: &mut TxContext) {
    let player = ctx.sender();
    state.players.add(player, PlayerData { ... });
    event::emit(PlayerJoined { player, round: state.round });
}
```

### PTB (Programmable Transaction Block) Power

```typescript
// TypeScript: Chain multiple calls in one transaction
const tx = new TransactionBlock();
const coin = tx.splitCoins(tx.gas, [tx.pure(1000)]);
const nft = tx.moveCall({
    target: `${PACKAGE}::nft::mint`,
    arguments: [mintCap, tx.pure("MyNFT"), coin],
});
tx.transferObjects([nft], tx.pure(recipient));
await client.signAndExecuteTransactionBlock({ transactionBlock: tx });
```

---

## Essential Resources

- [Move Book](https://move-book.com/) - Comprehensive Move guide
- [Code Quality Checklist](https://move-book.com/guides/code-quality-checklist/)
- [Sui Documentation](https://docs.sui.io/)
- [Sui Move Conventions](https://docs.sui.io/concepts/sui-move-concepts/conventions)
- [Move 2024 Edition Updates](https://blog.sui.io/move-edition-2024-update/)
- [Sui Objects Security](https://www.movebit.xyz/blog/post/Sui-Objects-Security-Principles-and-Best-Practices.html)

---

## Transfer Functions

| Function | When to Use | Object Requirements |
|----------|-------------|---------------------|
| `transfer::transfer` | Send owned object to address | `key` only |
| `transfer::public_transfer` | Send transferable object | `key + store` |
| `transfer::share_object` | Make globally accessible | `key` only |
| `transfer::freeze_object` | Make immutable | `key` only |
| `transfer::public_freeze_object` | Freeze transferable object | `key + store` |

```move
// Owned object - use transfer::transfer (module-only)
public struct AdminCap has key { id: UID }
transfer::transfer(admin_cap, recipient);

// Transferable asset - use public_transfer (anyone can transfer)
public struct NFT has key, store { id: UID, name: String }
transfer::public_transfer(nft, recipient);

// Shared object - anyone can access with &mut
transfer::share_object(game_state);

// Immutable - anyone can read, no one can modify
transfer::public_freeze_object(config);
```

---

## Deleting Objects

Objects with `key` ability MUST be explicitly deleted (they don't have `drop`).

```move
public struct Hero has key {
    id: UID,
    name: String,
}

// Delete owned object
public fun destroy_hero(hero: Hero) {
    let Hero { id, name: _ } = hero;  // Unpack struct
    id.delete();                       // Delete UID
}

// Delete with dynamic fields - MUST remove all first!
public fun destroy_hero_with_items(hero: Hero) {
    let Hero { mut id, name: _ } = hero;

    // Remove all dynamic fields first
    while (df::exists_(&id, some_key)) {
        let _: SomeType = df::remove(&mut id, some_key);
    };

    id.delete();
}
```

**Warning**: Deleting parent with dynamic object fields orphans children!

---

## Common Mistakes to Avoid

### Object & Ability Mistakes
1. **Forgetting `id: UID` as first field** for `key` structs
2. **Missing `store` ability** for objects you want to wrap or transfer publicly
3. **Adding unnecessary abilities** - use minimal set needed
4. **Not deleting UID** when destroying objects

### Pattern Mistakes
5. **Putting "Potato" in hot potato names** - abilities show the pattern
6. **Using `public entry`** instead of `public` or `entry`
7. **Not making functions composable** - return values for PTB chaining

### Storage Mistakes
8. **Using Table for small collections** - use VecMap or vector instead
9. **Deleting parent with dynamic object fields** - orphans children
10. **Not checking if dynamic field exists** before accessing

### Syntax Mistakes
11. **Not using method syntax** (`ctx.sender()` not `tx_context::sender(ctx)`)
12. **Explicit framework dependencies** - they're implicit in Sui 1.45+
13. **Using legacy module syntax** with curly braces
14. **Using `get_` prefix for getters** - use field name directly

---

## Testing Commands

```bash
# Build package
sui move build

# Run tests
sui move test

# Run specific test
sui move test test_name

# Test with coverage
sui move test --coverage

# Publish to devnet/testnet
sui client publish --gas-budget 100000000
```

---

## Hackathon Project: SuiPatron

> Patreon on Sui | Walrus + Seal + Enoki | 2 Move Devs + 1 FE | 8 hours

### Architecture

```
Registry (shared, created on deploy)
    │
    ├── Table<address, ID>  ──► by_addr
    └── Table<String, ID>   ──► by_name
                                   │
                                   ▼
                    CreatorProfile (shared, one per creator)
                        │
                        ├── df PostKey(0) -> Post
                        ├── df PostKey(1) -> Post
                        └── df SubKey(0xBob) -> bool
                                        │
                              subscribe() creates
                                        ▼
                              Subscription (owned by Bob)
                                   │
                             Seal checks this
```

### Dev Split

| Dev | Files |
|-----|-------|
| **Move Dev 1** | `registry.move`, `creator.move` |
| **Move Dev 2** | `subscription.move`, `seal_mock.move` |

---

### Structs

```move
// registry.move
public struct Registry has key {
    id: UID,
    by_addr: Table<address, ID>,
    by_name: Table<String, ID>,
    total: u64,
}

public struct CreatorRegistered has copy, drop {
    profile_id: ID,
    owner: address,
    name: String,
}
```

```move
// creator.move
public struct CREATOR has drop {}  // OTW

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
```

```move
// subscription.move
public struct Subscription has key, store {
    id: UID,
    profile_id: ID,
    subscriber: address,
    expires_at: u64,
    created_at: u64,
}

public struct SubKey has copy, drop, store { addr: address }

public struct Subscribed has copy, drop {
    sub_id: ID,
    profile_id: ID,
    subscriber: address,
    amount: u64,
    expires_at: u64,
}
```

---

### Functions

```move
// registry.move
fun init(ctx)                          // create shared Registry
public(package) fun add(reg, owner, name, profile_id)
```

```move
// creator.move
fun init(otw, ctx)                     // claim Publisher
entry fun register(publisher, reg, name, bio, price, clock, ctx)
entry fun publish_post(profile, title, preview, blob_id, encrypted, clock, ctx)
public(package) fun price(p): u64
public(package) fun owner(p): address
public(package) fun inc_subs(p)
```

```move
// subscription.move
entry fun subscribe(profile, payment, clock, ctx)
public(package) fun profile_id(s): ID
public(package) fun expires_at(s): u64
```

```move
// seal_mock.move
entry fun assert_access(sub, target_profile_id, clock)
```

---

### Patterns Used

| Pattern | Where |
|---------|-------|
| OTW + Publisher | `creator::init` |
| Shared Object | Registry, CreatorProfile |
| Dynamic Fields | Posts (PostKey), Subscribers (SubKey) |
| Owned Object | Subscription (for Seal verification) |
| Events | CreatorRegistered, PostPublished, Subscribed |

---

### Timeline

| Hour | Dev 1 | Dev 2 | FE |
|------|-------|-------|-----|
| 0-1 | registry.move | subscription.move | Setup + Enoki |
| 1-3 | creator.move | seal_mock.move | Creator list |
| 3-5 | Tests | Tests | Subscribe + Post view |
| 5-7 | Deploy | Deploy | Dashboard |
| 7-8 | Integration | Integration | Demo prep |

---

### Frontend Calls

```typescript
// Register creator
tx.moveCall({ target: `${PKG}::creator::register`,
  arguments: [publisher, registry, name, bio, price, clock] });

// Subscribe
const [coin] = tx.splitCoins(tx.gas, [price]);
tx.moveCall({ target: `${PKG}::subscription::subscribe`,
  arguments: [profile, coin, clock] });

// Publish post
tx.moveCall({ target: `${PKG}::creator::publish_post`,
  arguments: [profile, title, preview, blobId, encrypted, clock] });

// Verify access (before Walrus decrypt)
tx.moveCall({ target: `${PKG}::seal_mock::assert_access`,
  arguments: [subscription, profileId, clock] });
```

---

*Generated for Sui Move Bootcamp preparation. Focus on understanding patterns, not memorizing code. Good luck!*
