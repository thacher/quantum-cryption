#!/bin/bash

# Quantum Cryption Test Suite
# Tests all major functionality of the application

echo "🧪 Quantum Cryption Test Suite"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        if [ "$expected_status" = "200" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL (Expected $expected_status)${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        if [ "$expected_status" = "fail" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi
}

# Check if server is running
echo "🔍 Checking if development server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not running. Please start with 'npm run dev'${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: File Vault (Main Page)
run_test "File Vault Page" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" "200"

# Test 2: Password Manager
run_test "Password Manager Page" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/password-manager" "200"

# Test 3: Crypto Playground
run_test "Crypto Playground Page" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/playground" "200"

# Test 4: QES-512 Demo (replaced hybrid route)
run_test "QES-512 Demo Page" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/demo" "200"

# Test 5: Performance Analysis
run_test "Performance Analysis Page" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/performance" "200"

# Test 6: Verify old hybrid route is gone (should 404)
run_test "Old Hybrid Route (should 404)" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/hybrid | grep -q '404'" "200"

# Test 7: Check page content for QES-512
echo ""
echo "🔍 Checking page content..."
if curl -s http://localhost:3000/ | grep -q "QES-512"; then
    echo -e "${GREEN}✅ File Vault contains QES-512 content${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ File Vault missing QES-512 content${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 8: Check for educational warning
if curl -s http://localhost:3000/ | grep -q "Educational Use Only"; then
    echo -e "${GREEN}✅ Educational warning present${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Educational warning missing${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 9: Check navigation links
echo ""
echo "🔍 Checking navigation..."
if curl -s http://localhost:3000/ | grep -q 'href="/demo"'; then
    echo -e "${GREEN}✅ Demo page link present${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Demo page link missing${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 10: Check for old hybrid link (should not exist)
if curl -s http://localhost:3000/ | grep -q 'href="/hybrid"'; then
    echo -e "${RED}❌ Old hybrid link still present${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    echo -e "${GREEN}✅ Old hybrid link removed${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Summary
echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Quantum Cryption is working correctly.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the issues above.${NC}"
    exit 1
fi
