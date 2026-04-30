
import 'package:flutter/material.dart';
import 'screens/chat.dart';

void main()=>runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context){
    return MaterialApp(home: ChatScreen());
  }
}
