class Hospital {
  final String id;
  final String name;
  final String address;
  final String city;
  final String state;
  final String phone;
  final String? email;
  final String? website;
  final List<String> specialties;
  final int totalBeds;
  final int availableBeds;
  final int icuBeds;
  final bool emergency;
  final double lat;
  final double lng;
  final double rating;
  final String? image;
  final String workingHours;
  final int doctorsCount;
  final bool verified;

  Hospital({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.phone,
    this.email,
    this.website,
    required this.specialties,
    required this.totalBeds,
    required this.availableBeds,
    required this.icuBeds,
    required this.emergency,
    required this.lat,
    required this.lng,
    required this.rating,
    this.image,
    required this.workingHours,
    required this.doctorsCount,
    required this.verified,
  });

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      website: json['website'],
      specialties: List<String>.from(json['specialties'] ?? []),
      totalBeds: json['totalBeds'] ?? 0,
      availableBeds: json['availableBeds'] ?? 0,
      icuBeds: json['icuBeds'] ?? 0,
      emergency: json['emergency'] ?? false,
      lat: (json['lat'] ?? 0.0).toDouble(),
      lng: (json['lng'] ?? 0.0).toDouble(),
      rating: (json['rating'] ?? 0.0).toDouble(),
      image: json['image'],
      workingHours: json['workingHours'] ?? '24/7',
      doctorsCount: json['doctorsCount'] ?? 0,
      verified: json['verified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'city': city,
      'state': state,
      'phone': phone,
      'email': email,
      'website': website,
      'specialties': specialties,
      'totalBeds': totalBeds,
      'availableBeds': availableBeds,
      'icuBeds': icuBeds,
      'emergency': emergency,
      'lat': lat,
      'lng': lng,
      'rating': rating,
      'image': image,
      'workingHours': workingHours,
      'doctorsCount': doctorsCount,
      'verified': verified,
    };
  }

  int get occupancyPercent {
    if (totalBeds == 0) return 0;
    return ((totalBeds - availableBeds) / totalBeds * 100).round();
  }
}

class Doctor {
  final String id;
  final String name;
  final String specialty;
  final String? degree;
  final String? experience;
  final String? bio;
  final String? education;
  final List<String> languages;
  final double consultingFee;
  final bool isAvailable;
  final String? image;
  final String? hospitalId;
  final String? hospitalName;
  final double rating;
  final int reviewsCount;

  Doctor({
    required this.id,
    required this.name,
    required this.specialty,
    this.degree,
    this.experience,
    this.bio,
    this.education,
    required this.languages,
    required this.consultingFee,
    required this.isAvailable,
    this.image,
    this.hospitalId,
    this.hospitalName,
    required this.rating,
    required this.reviewsCount,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      specialty: json['specialty'] ?? '',
      degree: json['degree'],
      experience: json['experience'],
      bio: json['bio'],
      education: json['education'],
      languages: List<String>.from(json['languages'] ?? ['English']),
      consultingFee: (json['consultingFee'] ?? 500).toDouble(),
      isAvailable: json['isAvailable'] ?? true,
      image: json['image'],
      hospitalId: json['hospitalId'],
      hospitalName: json['hospitalName'],
      rating: (json['rating'] ?? 0.0).toDouble(),
      reviewsCount: json['reviewsCount'] ?? 0,
    );
  }
}

class Appointment {
  final String id;
  final String hospitalId;
  final String hospitalName;
  final String doctorId;
  final String doctorName;
  final String specialty;
  final String date;
  final String time;
  final String status; // pending, confirmed, completed, cancelled
  final String? notes;
  final double fee;
  final bool isOnline;
  final String? meetingLink;

  Appointment({
    required this.id,
    required this.hospitalId,
    required this.hospitalName,
    required this.doctorId,
    required this.doctorName,
    required this.specialty,
    required this.date,
    required this.time,
    required this.status,
    this.notes,
    required this.fee,
    required this.isOnline,
    this.meetingLink,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'] ?? '',
      hospitalId: json['hospitalId'] ?? '',
      hospitalName: json['hospitalName'] ?? '',
      doctorId: json['doctorId'] ?? '',
      doctorName: json['doctorName'] ?? '',
      specialty: json['specialty'] ?? '',
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'],
      fee: (json['fee'] ?? 0).toDouble(),
      isOnline: json['isOnline'] ?? false,
      meetingLink: json['meetingLink'],
    );
  }
}

class HealthRecord {
  final String id;
  final String title;
  final String type; // report, prescription, scan, vaccination
  final String? fileUrl;
  final String? notes;
  final String date;
  final String hospital;
  final String doctor;

  HealthRecord({
    required this.id,
    required this.title,
    required this.type,
    this.fileUrl,
    this.notes,
    required this.date,
    required this.hospital,
    required this.doctor,
  });

  factory HealthRecord.fromJson(Map<String, dynamic> json) {
    return HealthRecord(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? '',
      fileUrl: json['fileUrl'],
      notes: json['notes'],
      date: json['date'] ?? '',
      hospital: json['hospital'] ?? '',
      doctor: json['doctor'] ?? '',
    );
  }
}

class Medicine {
  final String id;
  final String name;
  final String? manufacturer;
  final String? composition;
  final String? uses;
  final String? sideEffects;
  final String? warnings;
  final String? imageUrl;
  final double? price;
  final bool verified;

  Medicine({
    required this.id,
    required this.name,
    this.manufacturer,
    this.composition,
    this.uses,
    this.sideEffects,
    this.warnings,
    this.imageUrl,
    this.price,
    required this.verified,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      manufacturer: json['manufacturer'],
      composition: json['composition'],
      uses: json['uses'],
      sideEffects: json['sideEffects'],
      warnings: json['warnings'],
      imageUrl: json['imageUrl'],
      price: json['price']?.toDouble(),
      verified: json['verified'] ?? false,
    );
  }
}

class BloodDonor {
  final String id;
  final String name;
  final String phone;
  final String bloodGroup;
  final String? city;
  final String? state;
  final bool available;
  final DateTime? lastDonated;

  BloodDonor({
    required this.id,
    required this.name,
    required this.phone,
    required this.bloodGroup,
    this.city,
    this.state,
    required this.available,
    this.lastDonated,
  });

  factory BloodDonor.fromJson(Map<String, dynamic> json) {
    return BloodDonor(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      bloodGroup: json['bloodGroup'] ?? '',
      city: json['city'],
      state: json['state'],
      available: json['available'] ?? true,
      lastDonated: json['lastDonated'] != null 
          ? DateTime.tryParse(json['lastDonated']) 
          : null,
    );
  }
}

class Pharmacy {
  final String id;
  final String name;
  final String address;
  final String city;
  final String state;
  final String phone;
  final double lat;
  final double lng;
  final double rating;
  final bool is24Hours;
  final bool deliveryAvailable;

  Pharmacy({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.phone,
    required this.lat,
    required this.lng,
    required this.rating,
    required this.is24Hours,
    required this.deliveryAvailable,
  });

  factory Pharmacy.fromJson(Map<String, dynamic> json) {
    return Pharmacy(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      phone: json['phone'] ?? '',
      lat: (json['lat'] ?? 0.0).toDouble(),
      lng: (json['lng'] ?? 0.0).toDouble(),
      rating: (json['rating'] ?? 0.0).toDouble(),
      is24Hours: json['is24Hours'] ?? false,
      deliveryAvailable: json['deliveryAvailable'] ?? false,
    );
  }
}

class Lab {
  final String id;
  final String name;
  final String address;
  final String city;
  final String state;
  final String phone;
  final double lat;
  final double lng;
  final double rating;
  final List<String> tests;
  final bool homeCollection;

  Lab({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.state,
    required this.phone,
    required this.lat,
    required this.lng,
    required this.rating,
    required this.tests,
    required this.homeCollection,
  });

  factory Lab.fromJson(Map<String, dynamic> json) {
    return Lab(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      phone: json['phone'] ?? '',
      lat: (json['lat'] ?? 0.0).toDouble(),
      lng: (json['lng'] ?? 0.0).toDouble(),
      rating: (json['rating'] ?? 0.0).toDouble(),
      tests: List<String>.from(json['tests'] ?? []),
      homeCollection: json['homeCollection'] ?? false,
    );
  }
}

class User {
  final String id;
  final String? name;
  final String? email;
  final String? phone;
  final String? avatar;
  final String? city;
  final int? age;
  final String? bloodGroup;
  final List<String> conditions;
  final String role; // patient, doctor, admin
  final bool emailVerified;

  User({
    required this.id,
    this.name,
    this.email,
    this.phone,
    this.avatar,
    this.city,
    this.age,
    this.bloodGroup,
    this.conditions = const [],
    required this.role,
    required this.emailVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      avatar: json['avatar'],
      city: json['city'],
      age: json['age'],
      bloodGroup: json['bloodGroup'],
      conditions: List<String>.from(json['conditions'] ?? []),
      role: json['role'] ?? 'patient',
      emailVerified: json['emailVerified'] ?? false,
    );
  }
}

class HealthMetric {
  final String id;
  final String date;
  final String? bloodPressure;
  final int? heartRate;
  final double? bloodSugar;
  final double? weight;
  final double? height;
  final double? temperature;
  final double? oxygenLevel;
  final String? notes;

  HealthMetric({
    required this.id,
    required this.date,
    this.bloodPressure,
    this.heartRate,
    this.bloodSugar,
    this.weight,
    this.height,
    this.temperature,
    this.oxygenLevel,
    this.notes,
  });

  factory HealthMetric.fromJson(Map<String, dynamic> json) {
    return HealthMetric(
      id: json['id'] ?? '',
      date: json['date'] ?? '',
      bloodPressure: json['bloodPressure'],
      heartRate: json['heartRate'],
      bloodSugar: json['bloodSugar']?.toDouble(),
      weight: json['weight']?.toDouble(),
      height: json['height']?.toDouble(),
      temperature: json['temperature']?.toDouble(),
      oxygenLevel: json['oxygenLevel']?.toDouble(),
      notes: json['notes'],
    );
  }
}