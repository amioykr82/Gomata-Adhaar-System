"""
Example usage of the Gomata Adhaar System
Demonstrates various features and capabilities
"""

from gomata_adhaar import GomataAdhaarSystem


def example_basic_registration():
    """Example: Basic cattle registration."""
    print("\n" + "="*60)
    print("EXAMPLE 1: Basic Cattle Registration")
    print("="*60)
    
    system = GomataAdhaarSystem("example_database.json")
    
    # Register a cattle
    adhaar_id = system.register_cattle(
        owner_name="Ram Kumar",
        breed="Jersey",
        age=5,
        gender="Female",
        color="Brown and white"
    )
    
    print(f"✓ Cattle registered successfully!")
    print(f"  Adhaar ID: {adhaar_id}")
    
    # Verify the cattle
    cattle_data = system.verify_cattle(adhaar_id)
    print(f"\n✓ Verification successful!")
    print(f"  Owner: {cattle_data['owner_name']}")
    print(f"  Breed: {cattle_data['breed']}")
    print(f"  Age: {cattle_data['age']} years")


def example_advanced_registration():
    """Example: Registration with additional information."""
    print("\n" + "="*60)
    print("EXAMPLE 2: Advanced Registration with Additional Info")
    print("="*60)
    
    system = GomataAdhaarSystem("example_database.json")
    
    # Register cattle with additional information
    adhaar_id = system.register_cattle(
        owner_name="Shyam Singh",
        breed="Gir",
        age=3,
        gender="Male",
        color="White with grey spots",
        location="Rajasthan, Jodhpur",
        health_status="Excellent",
        vaccination_status="Up to date",
        milk_production="15 liters/day"
    )
    
    print(f"✓ Cattle registered with additional details!")
    print(f"  Adhaar ID: {adhaar_id}")
    
    # Display all information
    cattle_data = system.verify_cattle(adhaar_id)
    print(f"\n  Complete Record:")
    for key, value in cattle_data.items():
        print(f"    {key}: {value}")


def example_owner_management():
    """Example: Managing multiple cattle for one owner."""
    print("\n" + "="*60)
    print("EXAMPLE 3: Managing Multiple Cattle for One Owner")
    print("="*60)
    
    system = GomataAdhaarSystem("example_database.json")
    
    owner_name = "Geeta Devi"
    
    # Register multiple cattle for the same owner
    cattle_ids = []
    
    breeds = [
        ("Holstein", 4, "Female", "Black and white"),
        ("Jersey", 6, "Female", "Brown"),
        ("Sahiwal", 3, "Male", "Reddish brown")
    ]
    
    for breed, age, gender, color in breeds:
        adhaar_id = system.register_cattle(
            owner_name=owner_name,
            breed=breed,
            age=age,
            gender=gender,
            color=color,
            location="Punjab"
        )
        cattle_ids.append(adhaar_id)
        print(f"✓ Registered {breed} with ID: {adhaar_id}")
    
    # Search for all cattle owned by this person
    print(f"\n✓ Searching for all cattle owned by '{owner_name}':")
    results = system.search_by_owner(owner_name)
    print(f"  Found {len(results)} cattle:")
    for cattle in results:
        print(f"    - {cattle['breed']} (ID: {cattle['adhaar_id']})")


def example_updates_and_tracking():
    """Example: Updating cattle information and tracking changes."""
    print("\n" + "="*60)
    print("EXAMPLE 4: Updating Information and Tracking")
    print("="*60)
    
    system = GomataAdhaarSystem("example_database.json")
    
    # Register a cattle
    adhaar_id = system.register_cattle(
        owner_name="Mohan Lal",
        breed="Red Sindhi",
        age=2,
        gender="Female",
        color="Red",
        location="Haryana"
    )
    
    print(f"✓ Initial registration with ID: {adhaar_id}")
    print(f"  Owner: Mohan Lal")
    print(f"  Location: Haryana")
    
    # Update owner and location
    system.update_cattle_info(
        adhaar_id,
        owner_name="Sohan Lal",
        location="Punjab",
        transfer_reason="Sold to new owner"
    )
    
    print(f"\n✓ Updated cattle information:")
    cattle_data = system.verify_cattle(adhaar_id)
    print(f"  New Owner: {cattle_data['owner_name']}")
    print(f"  New Location: {cattle_data['location']}")
    print(f"  Last Updated: {cattle_data['last_updated']}")


def example_lifecycle_management():
    """Example: Complete lifecycle from registration to deactivation."""
    print("\n" + "="*60)
    print("EXAMPLE 5: Complete Lifecycle Management")
    print("="*60)
    
    system = GomataAdhaarSystem("example_database.json")
    
    # Register
    adhaar_id = system.register_cattle(
        owner_name="Radha Krishna",
        breed="Tharparkar",
        age=1,
        gender="Female",
        color="Grey",
        location="Gujarat"
    )
    print(f"✓ Step 1: Registered cattle with ID: {adhaar_id}")
    
    # Update after 2 years
    system.update_cattle_info(adhaar_id, age=3, health_status="Good")
    print(f"✓ Step 2: Updated age and health status")
    
    # Mark as sold
    system.deactivate_cattle(adhaar_id, reason="Sold to another farm")
    print(f"✓ Step 3: Deactivated (Reason: Sold)")
    
    # Verify final status
    cattle_data = system.verify_cattle(adhaar_id)
    print(f"\n  Final Status:")
    print(f"    Status: {cattle_data['status']}")
    print(f"    Deactivation Date: {cattle_data['deactivation_date']}")
    print(f"    Reason: {cattle_data['deactivation_reason']}")


def example_statistics():
    """Example: Viewing system statistics."""
    print("\n" + "="*60)
    print("EXAMPLE 6: System Statistics and Reporting")
    print("="*60)
    
    system = GomataAdhaarSystem("example_database.json")
    
    # Get statistics
    stats = system.get_statistics()
    
    print(f"\n📊 System Statistics:")
    print(f"  Total Registered Cattle: {stats['total_registered']}")
    print(f"  Active Cattle: {stats['active']}")
    print(f"  Inactive Cattle: {stats['inactive']}")
    
    print(f"\n📈 Breed Distribution:")
    for breed, count in sorted(stats['breeds_distribution'].items()):
        percentage = (count / stats['total_registered'] * 100) if stats['total_registered'] > 0 else 0
        print(f"  {breed}: {count} ({percentage:.1f}%)")


def run_all_examples():
    """Run all examples."""
    import os
    
    # Clean up example database if it exists
    if os.path.exists("example_database.json"):
        os.remove("example_database.json")
    
    print("\n" + "="*60)
    print("GOMATA ADHAAR SYSTEM - USAGE EXAMPLES")
    print("="*60)
    
    example_basic_registration()
    example_advanced_registration()
    example_owner_management()
    example_updates_and_tracking()
    example_lifecycle_management()
    example_statistics()
    
    print("\n" + "="*60)
    print("All examples completed successfully!")
    print("="*60 + "\n")


if __name__ == "__main__":
    run_all_examples()
