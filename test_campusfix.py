import unittest
import json
from app import app, analyze_with_ai

class CampusFixAITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_example_problem_statement(self):
        """
        Verify the exact example from problem prompt:
        Input: 'The light near the library entrance hasn't been working.'
        Expected Output:
        Category: Electrical
        Priority: Medium / High
        Department: Maintenance / Electrical Maintenance
        Suggested Action: Inspect and replace the faulty light...
        """
        input_text = "The light near the library entrance hasn't been working."
        result = analyze_with_ai(input_text)
        
        self.assertEqual(result['category'], "Electrical")
        self.assertIn("Electrical Maintenance", result['department'])
        self.assertIn(result['priority'], ["High", "Medium"])
        self.assertTrue(len(result['suggested_action']) > 10)
        self.assertTrue("light" in result['title'].lower() or "electrical" in result['title'].lower())

    def test_plumbing_critical_issue(self):
        input_text = "Water is gushing out from a burst pipe in the 2nd floor restroom."
        result = analyze_with_ai(input_text)
        
        self.assertEqual(result['category'], "Plumbing")
        self.assertEqual(result['priority'], "Critical")
        self.assertIn("Water", result['department'])

    def test_waste_management_issue(self):
        input_text = "The trash bin outside cafeteria is overflowing with garbage and food waste."
        result = analyze_with_ai(input_text)
        
        self.assertEqual(result['category'], "Waste Management")
        self.assertIn("Sanitation", result['department'])

    def test_it_tech_issue(self):
        input_text = "Auditorium projector and HDMI cable are broken, wifi router is down."
        result = analyze_with_ai(input_text)
        
        self.assertEqual(result['category'], "IT & Tech")
        self.assertIn("IT", result['department'])

    def test_api_analyze_endpoint(self):
        response = self.app.post('/api/analyze',
                                 data=json.dumps({"description": "Broken door latch and cracked window glass"}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('analysis', data)
        self.assertEqual(data['analysis']['category'], "Infrastructure & Civil")

    def test_api_issues_crud(self):
        # Create an issue
        new_payload = {
            "title": "Test Fire Extinguisher Missing",
            "original_text": "Fire extinguisher is missing from Hallway C",
            "category": "Safety & Security",
            "priority": "High",
            "department": "Campus Security & Safety",
            "suggested_action": "Install replacement ABC fire extinguisher",
            "location": "Hallway C"
        }
        res_create = self.app.post('/api/issues',
                                   data=json.dumps(new_payload),
                                   content_type='application/json')
        self.assertEqual(res_create.status_code, 201)
        created_data = json.loads(res_create.data)
        created_id = created_data['issue']['id']

        # Get issues list
        res_list = self.app.get('/api/issues')
        self.assertEqual(res_list.status_code, 200)
        list_data = json.loads(res_list.data)
        self.assertTrue(any(i['id'] == created_id for i in list_data['issues']))

        # Update status
        res_patch = self.app.patch(f'/api/issues/{created_id}',
                                   data=json.dumps({"status": "Resolved"}),
                                   content_type='application/json')
        self.assertEqual(res_patch.status_code, 200)
        patch_data = json.loads(res_patch.data)
        self.assertEqual(patch_data['issue']['status'], "Resolved")

    def test_api_stats(self):
        response = self.app.get('/api/stats')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('total', data)
        self.assertIn('open', data)
        self.assertIn('resolved', data)

if __name__ == '__main__':
    unittest.main()

