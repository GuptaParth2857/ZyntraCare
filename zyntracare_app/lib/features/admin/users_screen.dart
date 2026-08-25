import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../data/services/api_service.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});
  @override State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  List<_User> _allUsers = [];
  List<_User> _filtered = [];
  bool _loading = true;
  int _currentPage = 0;
  static const int _perPage = 10;
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUsers();
    _searchCtrl.addListener(_filterUsers);
  }

  Future<void> _loadUsers() async {
    setState(() => _loading = true);
    try {
      final api = ApiService();
      final res = await api.get('/api/admin/users');
      if (res != null && res['data'] != null) {
        final list = (res['data'] as List).map((e) => _User.fromJson(e)).toList();
        _allUsers = list;
      } else {
        _allUsers = _mockUsers();
      }
    } catch (_) {
      _allUsers = _mockUsers();
    }
    if (mounted) {
      setState(() {
        _filtered = _allUsers;
        _loading = false;
      });
    }
  }

  List<_User> _mockUsers() {
    final names = [
      'Rajesh Kumar', 'Dr. Priya Sharma', 'Sunita Das', 'Amit Patel', 'Sneha Verma',
      'Vikram Singh', 'Ananya Gupta', 'Rohit Sharma', 'Dr. Meera Reddy', 'Karan Patel',
      'Neha Kapoor', 'Dr. Arjun Nair', 'Pooja Joshi', 'Manish Tiwari', 'Dr. Lata Menon',
      'Ravi Deshmukh', 'Shweta Mishra', 'Dr. Vikram Shah', 'Anjali Srinivasan', 'Deepak Rao',
      'Kavita Agarwal', 'Dr. Sanjay Bose', 'Ritu Jain', 'Gaurav Mehta', 'Dr. Nandini Pillai',
    ];
    final emails = [
      'rajesh@email.com', 'priya@hospital.com', 'sunita@email.com', 'amit@hospital.com', 'sneha@email.com',
      'vikram@admin.com', 'ananya@hospital.com', 'rohit@email.com', 'meera@hospital.com', 'karan@email.com',
      'neha@email.com', 'arjun@hospital.com', 'pooja@email.com', 'manish@email.com', 'lata@hospital.com',
      'ravi@email.com', 'shweta@email.com', 'vikram@hospital.com', 'anjali@email.com', 'deepak@email.com',
      'kavita@email.com', 'sanjay@hospital.com', 'ritu@email.com', 'gaurav@email.com', 'nandini@hospital.com',
    ];
    final roles = ['User', 'Doctor', 'User', 'Doctor', 'User', 'Admin', 'Doctor', 'User', 'Doctor', 'User',
      'User', 'Doctor', 'User', 'User', 'Doctor', 'User', 'User', 'Doctor', 'User', 'User',
      'User', 'Doctor', 'User', 'User', 'Doctor'];
    final dates = [
      '2026-06-20', '2026-06-19', '2026-06-18', '2026-06-15', '2026-06-14',
      '2026-06-12', '2026-06-10', '2026-06-08', '2026-06-05', '2026-06-01',
      '2026-05-28', '2026-05-25', '2026-05-22', '2026-05-20', '2026-05-18',
      '2026-05-15', '2026-05-12', '2026-05-10', '2026-05-08', '2026-05-05',
      '2026-05-02', '2026-04-30', '2026-04-28', '2026-04-25', '2026-04-22',
    ];
    return List.generate(25, (i) => _User(
      name: names[i],
      email: emails[i],
      role: roles[i],
      joined: dates[i],
    ));
  }

  void _filterUsers() {
    final query = _searchCtrl.text.toLowerCase();
    setState(() {
      _filtered = _allUsers.where((u) =>
        u.name.toLowerCase().contains(query) ||
        u.email.toLowerCase().contains(query)
      ).toList();
      _currentPage = 0;
    });
  }

  int get _totalPages => (_filtered.length / _perPage).ceil().clamp(1, 999);
  List<_User> get _pageUsers => _filtered.skip(_currentPage * _perPage).take(_perPage).toList();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            Expanded(
              child: _loading
                  ? _buildShimmer()
                  : Column(
                      children: [
                        _buildSearchBar(),
                        Expanded(child: _buildTable()),
                        _buildPagination(),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [ZyntraColors.cyan, ZyntraColors.purple],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Users', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              Text('${_allUsers.length} registered', style: GoogleFonts.inter(color: Colors.white70, fontSize: 11)),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.people_rounded, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: ZyntraColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ZyntraColors.border),
        ),
        child: Row(
          children: [
            const Icon(Icons.search_rounded, color: ZyntraColors.white40, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _searchCtrl,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Search by name or email...',
                  hintStyle: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13),
                  border: InputBorder.none,
                  isDense: true,
                ),
              ),
            ),
            if (_searchCtrl.text.isNotEmpty)
              GestureDetector(
                onTap: () => _searchCtrl.clear(),
                child: const Icon(Icons.clear_rounded, color: ZyntraColors.white40, size: 18),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTable() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: ZyntraColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZyntraColors.border),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: ZyntraColors.surface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(bottom: BorderSide(color: ZyntraColors.border)),
            ),
            child: Row(
              children: [
                Expanded(flex: 2, child: Text('User', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600))),
                Expanded(flex: 2, child: Text('Email', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600))),
                Expanded(flex: 1, child: Text('Role', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600), textAlign: TextAlign.center)),
                Expanded(flex: 1, child: Text('Joined', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10, fontWeight: FontWeight.w600), textAlign: TextAlign.end)),
              ],
            ),
          ),
          Expanded(
            child: _pageUsers.isEmpty
                ? Center(child: Text('No users found', style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 13)))
                : ListView.separated(
                    itemCount: _pageUsers.length,
                    separatorBuilder: (_, __) => Divider(color: ZyntraColors.border.withValues(alpha: 0.3), height: 1, indent: 14, endIndent: 14),
                    itemBuilder: (context, i) {
                      final u = _pageUsers[i];
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundColor: _roleColor(u.role).withValues(alpha: 0.2),
                                    child: Text(u.name[0].toUpperCase(), style: GoogleFonts.poppins(color: _roleColor(u.role), fontSize: 13, fontWeight: FontWeight.w700)),
                                  ),
                                  const SizedBox(width: 10),
                                  Flexible(child: Text(u.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis)),
                                ],
                              ),
                            ),
                            Expanded(
                              flex: 2,
                              child: Text(u.email, style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11), overflow: TextOverflow.ellipsis),
                            ),
                            Expanded(
                              flex: 1,
                              child: _buildRoleBadge(u.role),
                            ),
                            Expanded(
                              flex: 1,
                              child: Text(u.joined, style: GoogleFonts.inter(color: ZyntraColors.white40, fontSize: 10), textAlign: TextAlign.end),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleBadge(String role) {
    final color = _roleColor(role);
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(role, style: GoogleFonts.inter(color: color, fontSize: 9, fontWeight: FontWeight.w600)),
      ),
    );
  }

  Color _roleColor(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        return ZyntraColors.red;
      case 'doctor':
        return ZyntraColors.green;
      default:
        return ZyntraColors.cyan;
    }
  }

  Widget _buildPagination() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: _currentPage > 0 ? () => setState(() => _currentPage--) : null,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _currentPage > 0 ? ZyntraColors.card : ZyntraColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _currentPage > 0 ? ZyntraColors.border : ZyntraColors.border.withValues(alpha: 0.5)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.arrow_back_rounded, color: _currentPage > 0 ? Colors.white : ZyntraColors.white40, size: 14),
                  const SizedBox(width: 4),
                  Text('Prev', style: GoogleFonts.inter(color: _currentPage > 0 ? Colors.white : ZyntraColors.white40, fontSize: 11, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text('Page ${_currentPage + 1} of $_totalPages', style: GoogleFonts.inter(color: ZyntraColors.white70, fontSize: 11)),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _currentPage < _totalPages - 1 ? () => setState(() => _currentPage++) : null,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _currentPage < _totalPages - 1 ? ZyntraColors.card : ZyntraColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _currentPage < _totalPages - 1 ? ZyntraColors.border : ZyntraColors.border.withValues(alpha: 0.5)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Next', style: GoogleFonts.inter(color: _currentPage < _totalPages - 1 ? Colors.white : ZyntraColors.white40, fontSize: 11, fontWeight: FontWeight.w500)),
                  const SizedBox(width: 4),
                  Icon(Icons.arrow_forward_rounded, color: _currentPage < _totalPages - 1 ? Colors.white : ZyntraColors.white40, size: 14),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return Center(
      child: CircularProgressIndicator(color: ZyntraColors.cyan),
    );
  }
}

class _User {
  final String name;
  final String email;
  final String role;
  final String joined;
  const _User({required this.name, required this.email, required this.role, required this.joined});

  factory _User.fromJson(Map<String, dynamic> json) {
    return _User(
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'User',
      joined: json['joined'] ?? json['createdAt'] ?? '',
    );
  }
}
