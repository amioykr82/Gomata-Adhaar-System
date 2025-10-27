#!/usr/bin/env python3
"""
Gomata Adhaar System - Professional Cattle Identification System
Inspired by India's Aadhaar system, providing unique 12-digit IDs for cattle.
"""

import random
import json
import os
from datetime import datetime
from typing import Dict, Optional, List


class GomataAdhaarSystem:
    """
    Main class for managing cattle identification with unique 12-digit IDs.
    """
    
    def __init__(self, database_file: str = "cattle_database.json"):
        """
        Initialize the Gomata Adhaar System.
        
        Args:
            database_file: Path to the JSON file for storing cattle data
        """
        self.database_file = database_file
        self.cattle_records: Dict[str, Dict] = {}
        self.load_database()
    
    def generate_adhaar_id(self) -> str:
        """
        Generate a unique 12-digit Adhaar ID for cattle.
        Ensures the ID doesn't already exist in the system.
        
        Returns:
            A unique 12-digit string ID
        """
        while True:
            # Generate 12-digit number (100000000000 to 999999999999)
            adhaar_id = str(random.randint(100000000000, 999999999999))
            if adhaar_id not in self.cattle_records:
                return adhaar_id
    
    def register_cattle(self, owner_name: str, breed: str, age: int, 
                       gender: str, color: str, **additional_info) -> str:
        """
        Register a new cattle in the system with a unique Adhaar ID.
        
        Args:
            owner_name: Name of the cattle owner
            breed: Breed of the cattle (e.g., Jersey, Holstein, Gir)
            age: Age of the cattle in years
            gender: Gender (Male/Female/Ox)
            color: Color/markings of the cattle
            **additional_info: Additional information (location, health, etc.)
        
        Returns:
            The generated 12-digit Adhaar ID
        """
        adhaar_id = self.generate_adhaar_id()
        
        cattle_data = {
            "adhaar_id": adhaar_id,
            "owner_name": owner_name,
            "breed": breed,
            "age": age,
            "gender": gender,
            "color": color,
            "registration_date": datetime.now().isoformat(),
            "status": "Active",
            **additional_info
        }
        
        self.cattle_records[adhaar_id] = cattle_data
        self.save_database()
        
        return adhaar_id
    
    def verify_cattle(self, adhaar_id: str) -> Optional[Dict]:
        """
        Verify and retrieve cattle information by Adhaar ID.
        
        Args:
            adhaar_id: The 12-digit Adhaar ID to verify
        
        Returns:
            Dictionary containing cattle information if found, None otherwise
        """
        return self.cattle_records.get(adhaar_id)
    
    def update_cattle_info(self, adhaar_id: str, **updates) -> bool:
        """
        Update cattle information for an existing Adhaar ID.
        
        Args:
            adhaar_id: The 12-digit Adhaar ID
            **updates: Fields to update
        
        Returns:
            True if update successful, False if ID not found
        """
        if adhaar_id not in self.cattle_records:
            return False
        
        self.cattle_records[adhaar_id].update(updates)
        self.cattle_records[adhaar_id]["last_updated"] = datetime.now().isoformat()
        self.save_database()
        
        return True
    
    def deactivate_cattle(self, adhaar_id: str, reason: str = "") -> bool:
        """
        Deactivate a cattle record (e.g., sold, deceased).
        
        Args:
            adhaar_id: The 12-digit Adhaar ID
            reason: Reason for deactivation
        
        Returns:
            True if successful, False if ID not found
        """
        if adhaar_id not in self.cattle_records:
            return False
        
        self.cattle_records[adhaar_id]["status"] = "Inactive"
        self.cattle_records[adhaar_id]["deactivation_date"] = datetime.now().isoformat()
        if reason:
            self.cattle_records[adhaar_id]["deactivation_reason"] = reason
        
        self.save_database()
        return True
    
    def search_by_owner(self, owner_name: str) -> List[Dict]:
        """
        Search all cattle registered under a specific owner.
        
        Args:
            owner_name: Name of the owner to search for
        
        Returns:
            List of cattle records for the owner
        """
        results = []
        for record in self.cattle_records.values():
            if record.get("owner_name", "").lower() == owner_name.lower():
                results.append(record)
        return results
    
    def get_statistics(self) -> Dict:
        """
        Get system statistics.
        
        Returns:
            Dictionary with various statistics
        """
        total_cattle = len(self.cattle_records)
        active_cattle = sum(1 for r in self.cattle_records.values() if r.get("status") == "Active")
        inactive_cattle = total_cattle - active_cattle
        
        breeds = {}
        for record in self.cattle_records.values():
            breed = record.get("breed", "Unknown")
            breeds[breed] = breeds.get(breed, 0) + 1
        
        return {
            "total_registered": total_cattle,
            "active": active_cattle,
            "inactive": inactive_cattle,
            "breeds_distribution": breeds
        }
    
    def save_database(self):
        """Save cattle records to JSON file."""
        try:
            with open(self.database_file, 'w') as f:
                json.dump(self.cattle_records, f, indent=2)
        except (PermissionError, IOError) as e:
            print(f"Error saving database: {e}")
            raise
    
    def load_database(self):
        """Load cattle records from JSON file."""
        if os.path.exists(self.database_file):
            try:
                # Check if file is not empty before loading
                if os.path.getsize(self.database_file) > 0:
                    with open(self.database_file, 'r') as f:
                        self.cattle_records = json.load(f)
                else:
                    self.cattle_records = {}
            except (json.JSONDecodeError, PermissionError, IOError) as e:
                print(f"Error loading database: {e}. Starting with empty database.")
                self.cattle_records = {}
        else:
            self.cattle_records = {}


def print_cattle_info(cattle_data: Dict):
    """Pretty print cattle information."""
    if not cattle_data:
        print("Cattle not found!")
        return
    
    print("\n" + "="*50)
    print("GOMATA ADHAAR - CATTLE INFORMATION")
    print("="*50)
    for key, value in cattle_data.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
    print("="*50 + "\n")


def main():
    """Main CLI interface for the Gomata Adhaar System."""
    system = GomataAdhaarSystem()
    
    print("\n" + "="*60)
    print("    GOMATA ADHAAR SYSTEM - CATTLE IDENTIFICATION")
    print("    Professional Cattle ID Management System")
    print("="*60)
    
    while True:
        print("\n--- MENU ---")
        print("1. Register New Cattle")
        print("2. Verify Cattle by Adhaar ID")
        print("3. Update Cattle Information")
        print("4. Search by Owner Name")
        print("5. Deactivate Cattle")
        print("6. View System Statistics")
        print("7. Exit")
        
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == "1":
            print("\n--- REGISTER NEW CATTLE ---")
            owner = input("Owner Name: ").strip()
            breed = input("Breed (e.g., Jersey, Gir, Holstein): ").strip()
            age = input("Age (years): ").strip()
            gender = input("Gender (Male/Female/Ox): ").strip()
            color = input("Color/Markings: ").strip()
            location = input("Location (optional): ").strip()
            
            try:
                age = int(age)
                additional = {}
                if location:
                    additional["location"] = location
                
                adhaar_id = system.register_cattle(owner, breed, age, gender, color, **additional)
                print(f"\n✓ SUCCESS! Cattle registered with Adhaar ID: {adhaar_id}")
                print(f"  Please save this 12-digit ID for future reference.")
            except ValueError:
                print("✗ Error: Age must be a number")
        
        elif choice == "2":
            print("\n--- VERIFY CATTLE ---")
            adhaar_id = input("Enter 12-digit Adhaar ID: ").strip()
            cattle_data = system.verify_cattle(adhaar_id)
            print_cattle_info(cattle_data)
        
        elif choice == "3":
            print("\n--- UPDATE CATTLE INFORMATION ---")
            adhaar_id = input("Enter 12-digit Adhaar ID: ").strip()
            
            if not system.verify_cattle(adhaar_id):
                print("✗ Cattle not found!")
                continue
            
            print("Enter new information (press Enter to skip):")
            updates = {}
            
            owner = input("New Owner Name: ").strip()
            if owner:
                updates["owner_name"] = owner
            
            location = input("New Location: ").strip()
            if location:
                updates["location"] = location
            
            if updates:
                system.update_cattle_info(adhaar_id, **updates)
                print("✓ Information updated successfully!")
            else:
                print("No updates made.")
        
        elif choice == "4":
            print("\n--- SEARCH BY OWNER ---")
            owner = input("Enter Owner Name: ").strip()
            results = system.search_by_owner(owner)
            
            if results:
                print(f"\nFound {len(results)} cattle for owner '{owner}':")
                for cattle in results:
                    print(f"\n  Adhaar ID: {cattle['adhaar_id']}")
                    print(f"  Breed: {cattle['breed']}, Age: {cattle['age']}, Status: {cattle['status']}")
            else:
                print(f"No cattle found for owner '{owner}'")
        
        elif choice == "5":
            print("\n--- DEACTIVATE CATTLE ---")
            adhaar_id = input("Enter 12-digit Adhaar ID: ").strip()
            reason = input("Reason for deactivation: ").strip()
            
            if system.deactivate_cattle(adhaar_id, reason):
                print("✓ Cattle deactivated successfully!")
            else:
                print("✗ Cattle not found!")
        
        elif choice == "6":
            print("\n--- SYSTEM STATISTICS ---")
            stats = system.get_statistics()
            print(f"\nTotal Registered Cattle: {stats['total_registered']}")
            print(f"Active Cattle: {stats['active']}")
            print(f"Inactive Cattle: {stats['inactive']}")
            print("\nBreed Distribution:")
            for breed, count in stats['breeds_distribution'].items():
                print(f"  {breed}: {count}")
        
        elif choice == "7":
            print("\nThank you for using Gomata Adhaar System!")
            break
        
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
