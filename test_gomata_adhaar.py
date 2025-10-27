"""
Unit tests for the Gomata Adhaar System
"""

import unittest
import os
import json
import tempfile
from gomata_adhaar import GomataAdhaarSystem


class TestGomataAdhaarSystem(unittest.TestCase):
    """Test cases for the Gomata Adhaar System."""
    
    def setUp(self):
        """Set up test database."""
        # Use a temporary file for testing
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        self.test_db = self.temp_file.name
        self.temp_file.close()
        self.system = GomataAdhaarSystem(self.test_db)
    
    def tearDown(self):
        """Clean up test database."""
        if os.path.exists(self.test_db):
            os.remove(self.test_db)
    
    def test_generate_adhaar_id(self):
        """Test Adhaar ID generation."""
        adhaar_id = self.system.generate_adhaar_id()
        
        # Check it's a string of 12 digits
        self.assertEqual(len(adhaar_id), 12)
        self.assertTrue(adhaar_id.isdigit())
    
    def test_generate_unique_adhaar_ids(self):
        """Test that generated IDs are unique."""
        ids = set()
        for _ in range(100):
            adhaar_id = self.system.generate_adhaar_id()
            ids.add(adhaar_id)
        
        # All 100 IDs should be unique
        self.assertEqual(len(ids), 100)
    
    def test_register_cattle(self):
        """Test cattle registration."""
        adhaar_id = self.system.register_cattle(
            owner_name="Ram Kumar",
            breed="Jersey",
            age=5,
            gender="Female",
            color="Brown and white"
        )
        
        # Verify ID is 12 digits
        self.assertEqual(len(adhaar_id), 12)
        
        # Verify cattle is in database
        self.assertIn(adhaar_id, self.system.cattle_records)
        
        # Verify cattle data
        cattle_data = self.system.cattle_records[adhaar_id]
        self.assertEqual(cattle_data["owner_name"], "Ram Kumar")
        self.assertEqual(cattle_data["breed"], "Jersey")
        self.assertEqual(cattle_data["age"], 5)
        self.assertEqual(cattle_data["gender"], "Female")
        self.assertEqual(cattle_data["status"], "Active")
    
    def test_register_cattle_with_additional_info(self):
        """Test cattle registration with additional information."""
        adhaar_id = self.system.register_cattle(
            owner_name="Shyam Singh",
            breed="Gir",
            age=3,
            gender="Male",
            color="White",
            location="Maharashtra",
            health_status="Good"
        )
        
        cattle_data = self.system.cattle_records[adhaar_id]
        self.assertEqual(cattle_data["location"], "Maharashtra")
        self.assertEqual(cattle_data["health_status"], "Good")
    
    def test_verify_cattle(self):
        """Test cattle verification."""
        # Register a cattle
        adhaar_id = self.system.register_cattle(
            owner_name="Geeta Devi",
            breed="Holstein",
            age=4,
            gender="Female",
            color="Black and white"
        )
        
        # Verify cattle
        cattle_data = self.system.verify_cattle(adhaar_id)
        self.assertIsNotNone(cattle_data)
        self.assertEqual(cattle_data["owner_name"], "Geeta Devi")
        
        # Try to verify non-existent cattle
        fake_data = self.system.verify_cattle("999999999999")
        self.assertIsNone(fake_data)
    
    def test_update_cattle_info(self):
        """Test updating cattle information."""
        # Register a cattle
        adhaar_id = self.system.register_cattle(
            owner_name="Mohan Lal",
            breed="Sahiwal",
            age=2,
            gender="Female",
            color="Reddish brown"
        )
        
        # Update information
        success = self.system.update_cattle_info(
            adhaar_id,
            owner_name="Sohan Lal",
            location="Punjab"
        )
        
        self.assertTrue(success)
        
        cattle_data = self.system.cattle_records[adhaar_id]
        self.assertEqual(cattle_data["owner_name"], "Sohan Lal")
        self.assertEqual(cattle_data["location"], "Punjab")
        self.assertIn("last_updated", cattle_data)
        
        # Try to update non-existent cattle
        success = self.system.update_cattle_info("999999999999", owner_name="Test")
        self.assertFalse(success)
    
    def test_deactivate_cattle(self):
        """Test cattle deactivation."""
        # Register a cattle
        adhaar_id = self.system.register_cattle(
            owner_name="Radha Krishna",
            breed="Red Sindhi",
            age=6,
            gender="Female",
            color="Red"
        )
        
        # Deactivate cattle
        success = self.system.deactivate_cattle(adhaar_id, "Sold")
        self.assertTrue(success)
        
        cattle_data = self.system.cattle_records[adhaar_id]
        self.assertEqual(cattle_data["status"], "Inactive")
        self.assertEqual(cattle_data["deactivation_reason"], "Sold")
        self.assertIn("deactivation_date", cattle_data)
        
        # Try to deactivate non-existent cattle
        success = self.system.deactivate_cattle("999999999999", "Test")
        self.assertFalse(success)
    
    def test_search_by_owner(self):
        """Test searching cattle by owner name."""
        # Register multiple cattle for the same owner
        adhaar_id1 = self.system.register_cattle(
            owner_name="Hari Prasad",
            breed="Jersey",
            age=3,
            gender="Female",
            color="Brown"
        )
        
        adhaar_id2 = self.system.register_cattle(
            owner_name="Hari Prasad",
            breed="Gir",
            age=5,
            gender="Male",
            color="White"
        )
        
        # Register cattle for different owner
        adhaar_id3 = self.system.register_cattle(
            owner_name="Sita Ram",
            breed="Holstein",
            age=4,
            gender="Female",
            color="Black"
        )
        
        # Search for first owner
        results = self.system.search_by_owner("Hari Prasad")
        self.assertEqual(len(results), 2)
        
        # Search for second owner
        results = self.system.search_by_owner("Sita Ram")
        self.assertEqual(len(results), 1)
        
        # Search for non-existent owner
        results = self.system.search_by_owner("Non Existent")
        self.assertEqual(len(results), 0)
        
        # Test case-insensitive search
        results = self.system.search_by_owner("HARI PRASAD")
        self.assertEqual(len(results), 2)
    
    def test_get_statistics(self):
        """Test system statistics."""
        # Register multiple cattle
        id1 = self.system.register_cattle("Owner1", "Jersey", 3, "Female", "Brown")
        id2 = self.system.register_cattle("Owner2", "Jersey", 4, "Male", "White")
        id3 = self.system.register_cattle("Owner3", "Gir", 2, "Female", "Red")
        
        # Deactivate one
        self.system.deactivate_cattle(id1, "Sold")
        
        stats = self.system.get_statistics()
        
        self.assertEqual(stats["total_registered"], 3)
        self.assertEqual(stats["active"], 2)
        self.assertEqual(stats["inactive"], 1)
        self.assertEqual(stats["breeds_distribution"]["Jersey"], 2)
        self.assertEqual(stats["breeds_distribution"]["Gir"], 1)
    
    def test_database_persistence(self):
        """Test that data persists across instances."""
        # Register cattle in first instance
        adhaar_id = self.system.register_cattle(
            owner_name="Test Owner",
            breed="Test Breed",
            age=5,
            gender="Female",
            color="Test Color"
        )
        
        # Create new instance with same database
        new_system = GomataAdhaarSystem(self.test_db)
        
        # Verify cattle exists in new instance
        cattle_data = new_system.verify_cattle(adhaar_id)
        self.assertIsNotNone(cattle_data)
        self.assertEqual(cattle_data["owner_name"], "Test Owner")


if __name__ == "__main__":
    unittest.main()
