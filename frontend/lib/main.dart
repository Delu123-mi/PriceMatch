import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

void main() {
  runApp(const PriceMatchApp());
}

class PriceMatchApp extends StatelessWidget {
  const PriceMatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PriceMatch',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const SearchScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final Dio _dio = Dio();
  
  List<dynamic> _searchResults = [];
  bool _isLoading = false;

  // We will implement this search function next to connect to your local backend!
  Future<void> _searchProducts(String query) async {
    if (query.trim().isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      // Temporary: We will update this IP/URL to match your running Node.js server
      final response = await _dio.get('http://localhost:5000/api/products/search?q=$query');
      
      setState(() {
        _searchResults = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error connecting to server: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PriceMatch Search', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.teal.shade100,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Search Input Field
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search groceries (e.g., Milk, Bread)...',
                prefixIcon: const Icon(Icons.search, color: Colors.teal),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () => _searchController.clear(),
                ),
              ),
              onSubmitted: _searchProducts,
            ),
            const SizedBox(height: 20),
            
            // Results Display Area
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _searchResults.isEmpty
                      ? const Center(child: Text('Type a grocery item to find the best deal!'))
                      : ListView.builder(
                          itemCount: _searchResults.length,
                          itemBuilder: (context, index) {
                            final item = _searchResults[index];
                            return Card(
                              elevation: 2,
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              child: ListTile(
                                leading: const Icon(Icons.shopping_bag, color: Colors.teal),
                                title: Text(item['name'] ?? 'Unknown Product', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Category: ${item['category'] ?? 'N/A'}'),
                                trailing: Text(
                                  '\$${item['cheapestPrice']?.toStringAsFixed(2) ?? '0.00'}',
                                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}