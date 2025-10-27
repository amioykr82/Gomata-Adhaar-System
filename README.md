# Gomata Adhaar System 🐄

A **professional cattle identification system** modeled after India's human Aadhaar system, providing unique 12-digit identification numbers for cows.

## 📋 Overview

The Gomata Adhaar System is a comprehensive cattle management solution that provides:

- **Unique 12-digit Adhaar IDs** for each registered cattle
- **Complete cattle information management** (breed, age, owner, location, etc.)
- **Verification and authentication** of cattle records
- **Search and tracking** capabilities
- **Data persistence** with JSON-based storage
- **Statistics and reporting** features

## 🚀 Features

### Core Features

1. **Cattle Registration**: Register new cattle with comprehensive details
2. **ID Generation**: Automatic generation of unique 12-digit Adhaar IDs
3. **Verification**: Quick verification of cattle using Adhaar ID
4. **Information Updates**: Update cattle information as needed
5. **Owner Search**: Search all cattle registered under a specific owner
6. **Deactivation**: Mark cattle as inactive (sold, deceased, etc.)
7. **Statistics**: View system-wide statistics and breed distribution

### Data Management

- **Persistent Storage**: All data stored in JSON format
- **Unique IDs**: Guaranteed unique 12-digit identification numbers
- **Status Tracking**: Active/Inactive status for all records
- **Timestamp Tracking**: Registration and update timestamps
- **Flexible Schema**: Support for additional custom fields

## 📦 Installation

### Prerequisites

- Python 3.6 or higher

### Setup

1. Clone the repository:
```bash
git clone https://github.com/amioykr82/Gomata-Adhaar-System.git
cd Gomata-Adhaar-System
```

2. No additional dependencies required - uses Python standard library only!

## 💻 Usage

### Command Line Interface

Run the interactive CLI:

```bash
python gomata_adhaar.py
```

The system provides an interactive menu with the following options:

1. **Register New Cattle** - Add a new cattle to the system
2. **Verify Cattle by Adhaar ID** - Look up cattle information
3. **Update Cattle Information** - Modify existing records
4. **Search by Owner Name** - Find all cattle for an owner
5. **Deactivate Cattle** - Mark cattle as inactive
6. **View System Statistics** - See system-wide statistics
7. **Exit** - Close the application

### Programmatic Usage

```python
from gomata_adhaar import GomataAdhaarSystem

# Initialize the system
system = GomataAdhaarSystem()

# Register a new cattle
adhaar_id = system.register_cattle(
    owner_name="Ram Kumar",
    breed="Jersey",
    age=5,
    gender="Female",
    color="Brown and white",
    location="Maharashtra"
)
print(f"Registered with Adhaar ID: {adhaar_id}")

# Verify cattle
cattle_data = system.verify_cattle(adhaar_id)
if cattle_data:
    print(f"Owner: {cattle_data['owner_name']}")
    print(f"Breed: {cattle_data['breed']}")

# Update information
system.update_cattle_info(adhaar_id, location="Gujarat")

# Search by owner
results = system.search_by_owner("Ram Kumar")
print(f"Found {len(results)} cattle")

# Get statistics
stats = system.get_statistics()
print(f"Total cattle: {stats['total_registered']}")
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_gomata_adhaar.py
```

The test suite includes:
- Adhaar ID generation and uniqueness tests
- Registration functionality tests
- Verification and authentication tests
- Update and modification tests
- Search functionality tests
- Statistics calculation tests
- Database persistence tests

## 📊 Data Structure

Each cattle record contains:

### Required Fields
- `adhaar_id`: Unique 12-digit identification number
- `owner_name`: Name of the cattle owner
- `breed`: Breed of the cattle (e.g., Jersey, Gir, Holstein)
- `age`: Age in years
- `gender`: Male/Female/Ox
- `color`: Color and markings
- `registration_date`: ISO format timestamp
- `status`: Active/Inactive

### Optional Fields
- `location`: Geographic location
- `health_status`: Current health condition
- `last_updated`: Last modification timestamp
- `deactivation_date`: Date when marked inactive
- `deactivation_reason`: Reason for deactivation
- Any custom fields you need

## 📁 File Structure

```
Gomata-Adhaar-System/
├── gomata_adhaar.py          # Main system implementation
├── test_gomata_adhaar.py     # Comprehensive test suite
├── cattle_database.json      # Data storage (auto-created)
├── examples.py               # Usage examples
└── README.md                 # This file
```

## 🔒 Data Storage

The system uses a JSON file (`cattle_database.json`) for data persistence:

- **Auto-created**: Created automatically on first run
- **Human-readable**: JSON format for easy inspection
- **Portable**: Can be backed up, transferred, or version controlled
- **Reliable**: Atomic writes ensure data integrity

## 🎯 Use Cases

1. **Dairy Farm Management**: Track all cattle in dairy operations
2. **Veterinary Services**: Maintain health records for cattle
3. **Cattle Trading**: Verify ownership and authenticity during trades
4. **Government Records**: Maintain national cattle registry
5. **Insurance**: Verify cattle for insurance purposes
6. **Breeding Programs**: Track lineage and breeding information

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Inspired by India's Aadhaar system - the world's largest biometric identification system.

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for the welfare of Gomata (Holy Cow)**