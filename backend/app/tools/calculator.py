"""Safe mathematical calculation tool.

Evaluates mathematical expressions using Python AST inspection.
Strictly disallows eval(), exec(), arbitrary variable access, or code injection.
"""

import ast
import math
import operator
from typing import Any
from backend.app.tools.base import BaseTool, ToolResult, RiskLevel

# Allowed binary and unary operators
OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

# Allowed mathematical constants and functions
MATH_FUNCTIONS = {
    "sqrt": math.sqrt,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "log": math.log,
    "log10": math.log10,
    "exp": math.exp,
    "abs": abs,
    "round": round,
    "pi": math.pi,
    "e": math.e,
}


def safe_eval(node: ast.AST) -> Any:
    """Recursively evaluate an AST node strictly within the safe math allowlist."""
    if isinstance(node, ast.Expression):
        return safe_eval(node.body)
    elif isinstance(node, ast.Constant):  # Numbers (int, float)
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant type: {type(node.value).__name__}")
    elif isinstance(node, ast.Name):
        if node.id in MATH_FUNCTIONS:
            return MATH_FUNCTIONS[node.id]
        raise ValueError(f"Undefined or unauthorized symbol: '{node.id}'")
    elif isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type in OPERATORS:
            left = safe_eval(node.left)
            right = safe_eval(node.right)
            # Guard against excessive exponential computations (Denial of Service)
            if op_type is ast.Pow and (right > 1000 or left > 10000):
                raise ValueError("Exponent or base is too large to safely compute.")
            return OPERATORS[op_type](left, right)
        raise ValueError(f"Unsupported operator: {op_type.__name__}")
    elif isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type in OPERATORS:
            operand = safe_eval(node.operand)
            return OPERATORS[op_type](operand)
        raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
    elif isinstance(node, ast.Call):
        func = safe_eval(node.func)
        if func not in MATH_FUNCTIONS.values():
            raise ValueError("Only designated math functions may be called.")
        args = [safe_eval(arg) for arg in node.args]
        return func(*args)
    else:
        raise ValueError(f"Forbidden or unsupported syntax: {type(node).__name__}")


class SafeCalculatorTool(BaseTool):
    """Safely computes mathematical equations without arbitrary code execution."""

    name = "calculator"
    description = "Computes mathematical expressions (e.g. 'sqrt(144) + 15 * 3'). Safe and sandboxed."
    risk_level = RiskLevel.LOW

    async def execute(self, expression: str = "", **kwargs) -> ToolResult:
        expr = expression.strip()
        if not expr:
            return ToolResult(
                success=False,
                error="No mathematical expression provided.",
                action_summary="Calculator failed: empty expression",
            )

        try:
            parsed = ast.parse(expr, mode="eval")
            result = safe_eval(parsed)
            return ToolResult(
                success=True,
                data={"expression": expr, "result": result},
                action_summary=f"Computed: {expr} = {result}",
            )
        except Exception as e:
            return ToolResult(
                success=False,
                error=f"Math evaluation error: {str(e)}",
                action_summary=f"Calculator error on '{expr}': {str(e)}",
            )
