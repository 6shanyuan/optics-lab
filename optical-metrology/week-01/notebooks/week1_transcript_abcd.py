import numpy as np
import matplotlib.pyplot as plt

# 单位：mm；角度：rad
f, u, v = 50.0, 150.0, 75.0

def free_space(distance):
    return np.array([[1.0, distance], [0.0, 1.0]])

def thin_lens(focal_length):
    return np.array([[1.0, 0.0], [-1.0 / focal_length, 1.0]])

M = free_space(v) @ thin_lens(f) @ free_space(u)
print("系统矩阵：", M, sep="\n")
print("B =", M[0, 1])
for theta in np.linspace(-0.02, 0.02, 5):
    ray_out = M @ np.array([0.0, theta])
    print(f"入射角={theta:.3f} rad, 像面高度={ray_out[0]:.6f} mm")
