# Quick Start Guide - Gomata Adhaar System

## Get Started in 3 Steps

### Step 1: Run the Interactive System

```bash
python gomata_adhaar.py
```

### Step 2: Register Your First Cattle

Choose option `1` from the menu and enter:
```
Owner Name: Ram Kumar
Breed: Jersey
Age: 5
Gender: Female
Color: Brown and white
Location: Maharashtra
```

You'll receive a unique 12-digit Adhaar ID like: `245853627117`

### Step 3: Verify the Registration

Choose option `2` from the menu and enter the Adhaar ID you received.

## Common Tasks

### Register Multiple Cattle
Just use option `1` repeatedly. Each cattle gets a unique ID.

### Find All Cattle for an Owner
Use option `4` and enter the owner name (case-insensitive).

### Update Cattle Information
Use option `3`, enter the Adhaar ID, and update any fields.

### View Statistics
Use option `6` to see total cattle, breeds distribution, etc.

### Deactivate a Record
Use option `5` when a cattle is sold, deceased, or transferred.

## Programmatic Usage Example

```python
from gomata_adhaar import GomataAdhaarSystem

# Initialize
system = GomataAdhaarSystem()

# Register
id = system.register_cattle(
    owner_name="Ram Kumar",
    breed="Jersey",
    age=5,
    gender="Female",
    color="Brown"
)

# Verify
cattle = system.verify_cattle(id)
print(f"Registered: {cattle['breed']} owned by {cattle['owner_name']}")

# Search
results = system.search_by_owner("Ram Kumar")
print(f"Found {len(results)} cattle")

# Update
system.update_cattle_info(id, location="New Location")

# Statistics
stats = system.get_statistics()
print(f"Total: {stats['total_registered']} cattle")
```

## Run Examples

```bash
python examples.py
```

This will demonstrate all features with 6 complete examples.

## Run Tests

```bash
python test_gomata_adhaar.py
```

All 10 tests should pass successfully.

## Tips

- **Save the Adhaar ID**: Always note down the 12-digit ID after registration
- **Database File**: Data is saved in `cattle_database.json` automatically
- **Backup**: Copy `cattle_database.json` to backup your data
- **Custom Fields**: Add any additional fields when registering (location, health, etc.)
- **Search**: Owner search is case-insensitive
- **Updates**: Any field can be updated except the Adhaar ID itself

## Need Help?

- Read the full documentation in `README.md`
- Check implementation details in `IMPLEMENTATION_SUMMARY.md`
- Run `examples.py` to see all features in action

---

**Ready to manage your cattle professionally!** 🐄
