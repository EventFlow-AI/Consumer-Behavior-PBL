import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_application/main.dart';

void main() {
  testWidgets('RahatSetuApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const RahatSetuApp());
    expect(find.text('Rahat Setu'), findsWidgets);
  });
}
