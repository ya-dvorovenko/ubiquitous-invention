# SuiPatron Structs

## registry.move

### Registry
```
has key (shared)
- id: UID
- by_addr: Table<address, ID>
- by_name: Table<String, ID>
- total: u64
```

### CreatorRegistered (event)
```
has copy, drop
- profile_id: ID
- owner: address
- name: String
```

---

## creator.move

### CREATOR
```
has drop (OTW)
```

### CreatorProfile
```
has key (shared)
- id: UID
- owner: address
- name: String
- bio: String
- price: u64
- total_posts: u64
- total_subs: u64
- created_at: u64
```

### Post
```
has store, drop (dynamic field)
- post_id: u64
- title: String
- preview: String
- blob_id: String
- encrypted: bool
- created_at: u64
```

### PostKey
```
has copy, drop, store (DF key)
- post_id: u64
```

### PostPublished (event)
```
has copy, drop
- profile_id: ID
- post_id: u64
- title: String
- blob_id: String
```

---

## subscription.move

### Subscription
```
has key, store (owned)
- id: UID
- profile_id: ID
- subscriber: address
- expires_at: u64
- created_at: u64
```

### SubKey
```
has copy, drop, store (DF key)
- addr: address
```

### Subscribed (event)
```
has copy, drop
- sub_id: ID
- profile_id: ID
- subscriber: address
- amount: u64
- expires_at: u64
```

---

## seal_mock.move

No structs (uses Subscription from subscription.move)
