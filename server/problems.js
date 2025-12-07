// Open source coding problems database
// Problems sourced from LeetCode, HackerRank, and other platforms
// Each problem includes test cases for validation

const problems = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      {
        input: [[2,7,11,15], 9],
        expectedOutput: [0,1]
      },
      {
        input: [[3,2,4], 6],
        expectedOutput: [1,2]
      },
      {
        input: [[3,3], 6],
        expectedOutput: [0,1]
      }
    ],
    languages: {
      javascript: {
        template: `function twoSum(nums, target) {
    // Your code here

}`,
        testRunner: `function runTests() {
    const testCases = [
        { input: [[2,7,11,15], 9], expected: [0,1] },
        { input: [[3,2,4], 6], expected: [1,2] },
        { input: [[3,3], 6], expected: [0,1] }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const result = twoSum(...testCases[i].input);
        if (JSON.stringify(result.sort()) !== JSON.stringify(testCases[i].expected.sort())) {
            throw new Error(\`Test case \${i + 1} failed. Expected: \${JSON.stringify(testCases[i].expected)}, Got: \${JSON.stringify(result)}\`);
        }
    }
    return "All tests passed!";
}`
      },
      python: {
        template: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here
    pass`,
        testRunner: `import json

def run_tests():
    test_cases = [
        {"input": [[2,7,11,15], 9], "expected": [0,1]},
        {"input": [[3,2,4], 6], "expected": [1,2]},
        {"input": [[3,3], 6], "expected": [0,1]}
    ]

    for i, test in enumerate(test_cases):
        result = two_sum(*test["input"])
        if sorted(result) != sorted(test["expected"]):
            raise Exception(f"Test case {i+1} failed. Expected: {test['expected']}, Got: {result}")

    return "All tests passed!"`
      },
      java: {
        template: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here

    }
}`,
        testRunner: `import java.util.*;

public class TestRunner {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[][][] testCases = {
            {{2,7,11,15}, {9}},
            {{3,2,4}, {6}},
            {{3,3}, {6}}
        };

        int[][] expectedResults = {
            {0,1}, {1,2}, {0,1}
        };

        for (int i = 0; i < testCases.length; i++) {
            int[] result = solution.twoSum(testCases[i][0], testCases[i][1][0]);
            Arrays.sort(result);
            Arrays.sort(expectedResults[i]);
            if (!Arrays.equals(result, expectedResults[i])) {
                System.out.println("Test case " + (i+1) + " failed. Expected: " +
                    Arrays.toString(expectedResults[i]) + ", Got: " + Arrays.toString(result));
                System.exit(1);
            }
        }

        System.out.println("All tests passed!");
    }
}`
      },
      cpp: {
        template: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here

    }
};`,
        testRunner: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    Solution solution;

    vector<vector<int>> testInputs = {
        {2,7,11,15}, {3,2,4}, {3,3}
    };
    vector<int> targets = {9, 6, 6};
    vector<vector<int>> expectedResults = {
        {0,1}, {1,2}, {0,1}
    };

    for (size_t i = 0; i < testInputs.size(); i++) {
        vector<int> result = solution.twoSum(testInputs[i], targets[i]);
        sort(result.begin(), result.end());
        sort(expectedResults[i].begin(), expectedResults[i].end());

        if (result != expectedResults[i]) {
            cout << "Test case " << (i+1) << " failed." << endl;
            return 1;
        }
    }

    cout << "All tests passed!" << endl;
    return 0;
}`
      }
    }
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    category: 'Math',
    description: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given n, calculate F(n).`,
    examples: [
      {
        input: 'n = 2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.'
      },
      {
        input: 'n = 3',
        output: '2'
      }
    ],
    constraints: [
      '0 <= n <= 30'
    ],
    testCases: [
      { input: [2], expectedOutput: 1 },
      { input: [3], expectedOutput: 2 },
      { input: [4], expectedOutput: 3 },
      { input: [0], expectedOutput: 0 },
      { input: [1], expectedOutput: 1 }
    ],
    languages: {
      javascript: {
        template: `/**
 * @param {number} n
 * @return {number}
 */
var fib = function(n) {
    // Your code here

};`,
        testRunner: `function runTests() {
    const testCases = [
        { input: [2], expected: 1 },
        { input: [3], expected: 2 },
        { input: [4], expected: 3 },
        { input: [0], expected: 0 },
        { input: [1], expected: 1 }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const result = fib(...testCases[i].input);
        if (result !== testCases[i].expected) {
            throw new Error(\`Test case \${i + 1} failed. Expected: \${testCases[i].expected}, Got: \${result}\`);
        }
    }
    return "All tests passed!";
}`
      },
      python: {
        template: `class Solution:
    def fib(self, n: int) -> int:
        # Your code here
        pass`,
        testRunner: `def run_tests():
    solution = Solution()

    test_cases = [
        {"input": [2], "expected": 1},
        {"input": [3], "expected": 2},
        {"input": [4], "expected": 3},
        {"input": [0], "expected": 0},
        {"input": [1], "expected": 1}
    ]

    for i, test in enumerate(test_cases):
        result = solution.fib(*test["input"])
        if result != test["expected"]:
            raise Exception(f"Test case {i+1} failed. Expected: {test['expected']}, Got: {result}")

    return "All tests passed!"`
      },
      java: {
        template: `class Solution {
    public int fib(int n) {
        // Your code here

    }
}`,
        testRunner: `public class TestRunner {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[][] testCases = {
            {2}, {3}, {4}, {0}, {1}
        };

        int[] expectedResults = {1, 2, 3, 0, 1};

        for (int i = 0; i < testCases.length; i++) {
            int result = solution.fib(testCases[i][0]);
            if (result != expectedResults[i]) {
                System.out.println("Test case " + (i+1) + " failed. Expected: " +
                    expectedResults[i] + ", Got: " + result);
                System.exit(1);
            }
        }

        System.out.println("All tests passed!");
    }
}`
      },
      cpp: {
        template: `class Solution {
public:
    int fib(int n) {
        // Your code here

    }
};`,
        testRunner: `#include <iostream>
using namespace std;

int main() {
    Solution solution;

    int testCases[] = {2, 3, 4, 0, 1};
    int expectedResults[] = {1, 2, 3, 0, 1};

    for (int i = 0; i < 5; i++) {
        int result = solution.fib(testCases[i]);
        if (result != expectedResults[i]) {
            cout << "Test case " << (i+1) << " failed. Expected: " <<
                expectedResults[i] << ", Got: " << result << endl;
            return 1;
        }
    }

    cout << "All tests passed!" << endl;
    return 0;
}`
      }
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'String',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    testCases: [
      { input: ['()'], expectedOutput: true },
      { input: ['()[]{}'], expectedOutput: true },
      { input: ['(]'], expectedOutput: false },
      { input: ['([)]'], expectedOutput: false },
      { input: ['{[]}'], expectedOutput: true }
    ],
    languages: {
      javascript: {
        template: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your code here

};`,
        testRunner: `function runTests() {
    const testCases = [
        { input: ['()'], expected: true },
        { input: ['()[]{}'], expected: true },
        { input: ['(]'], expected: false },
        { input: ['([)]'], expected: false },
        { input: ['{[]}'], expected: true }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const result = isValid(...testCases[i].input);
        if (result !== testCases[i].expected) {
            throw new Error(\`Test case \${i + 1} failed. Expected: \${testCases[i].expected}, Got: \${result}\`);
        }
    }
    return "All tests passed!";
}`
      },
      python: {
        template: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your code here
        pass`,
        testRunner: `def run_tests():
    solution = Solution()

    test_cases = [
        {"input": ["()"], "expected": True},
        {"input": ["()[]{}"], "expected": True},
        {"input": ["(]"], "expected": False},
        {"input": ["([)]"], "expected": False},
        {"input": ["{[]}"], "expected": True}
    ]

    for i, test in enumerate(test_cases):
        result = solution.isValid(*test["input"])
        if result != test["expected"]:
            raise Exception(f"Test case {i+1} failed. Expected: {test['expected']}, Got: {result}")

    return "All tests passed!"`
      },
      java: {
        template: `class Solution {
    public boolean isValid(String s) {
        // Your code here

    }
}`,
        testRunner: `import java.util.*;

public class TestRunner {
    public static void main(String[] args) {
        Solution solution = new Solution();

        String[] testCases = {"()", "()[]{}", "(]", "([)]", "{[]}"};
        boolean[] expectedResults = {true, true, false, false, true};

        for (int i = 0; i < testCases.length; i++) {
            boolean result = solution.isValid(testCases[i]);
            if (result != expectedResults[i]) {
                System.out.println("Test case " + (i+1) + " failed. Expected: " +
                    expectedResults[i] + ", Got: " + result);
                System.exit(1);
            }
        }

        System.out.println("All tests passed!");
    }
}`
      },
      cpp: {
        template: `#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Your code here

    }
};`,
        testRunner: `#include <iostream>
#include <string>
using namespace std;

int main() {
    Solution solution;

    string testCases[] = {"()", "()[]{}", "(]", "([)]", "{[]}"};
    bool expectedResults[] = {true, true, false, false, true};

    for (int i = 0; i < 5; i++) {
        bool result = solution.isValid(testCases[i]);
        if (result != expectedResults[i]) {
            cout << "Test case " << (i+1) << " failed. Expected: " <<
                (expectedResults[i] ? "true" : "false") << ", Got: " <<
                (result ? "true" : "false") << endl;
            return 1;
        }
    }

    cout << "All tests passed!" << endl;
    return 0;
}`
      }
    }
  }
];

module.exports = { problems };
