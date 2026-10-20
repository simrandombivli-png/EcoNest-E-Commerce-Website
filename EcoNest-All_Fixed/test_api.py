import unittest
import tempfile
import os
import importlib.util

class EcoNestApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tempdir = tempfile.TemporaryDirectory()
        os.environ["ECONEST_DB_PATH"] = os.path.join(cls.tempdir.name, "test.db")
        spec = importlib.util.spec_from_file_location("econest_app", os.path.join(os.path.dirname(__file__), "app.py"))
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)
        cls.client = cls.module.app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.tempdir.cleanup()

    def test_health(self):
        self.assertEqual(self.client.get("/api/health").status_code, 200)

    def test_seeded_products(self):
        response = self.client.get("/api/products")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["total"], 12)

    def test_category_filter(self):
        response = self.client.get("/api/products?category=Solar%20%26%20Energy")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(p["category"] == "Solar & Energy" for p in response.json["products"]))

if __name__ == "__main__":
    unittest.main()
