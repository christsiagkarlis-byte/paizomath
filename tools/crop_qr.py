from pathlib import Path
import cv2
import numpy as np

src = Path('/home/ubuntu/paizomath-contact-work/images/paypal-tip-qr-xristos-tsiagkarlis.jpg')
out = src.with_name('paypal-qr-only.png')
image = cv2.imread(str(src))
if image is None:
    raise SystemExit('QR source image not found')
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
# Cyan corner markers in the supplied PayPal QR artwork.
mask = cv2.inRange(hsv, np.array([75, 70, 90], dtype=np.uint8), np.array([110, 255, 255], dtype=np.uint8))
num, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
points = []
for x, y, w, h, area in stats[1:]:
    if 30 <= w <= 220 and 30 <= h <= 220 and 500 <= area <= 30000:
        points.append((x, y, w, h, area))
if len(points) < 3:
    # Conservative fallback based on the known poster composition.
    x1, y1, x2, y2 = 230, 1280, 1050, 2220
else:
    x1 = max(0, min(p[0] for p in points) - 55)
    y1 = max(0, min(p[1] for p in points) - 55)
    x2 = min(image.shape[1], max(p[0] + p[2] for p in points) + 55)
    y2 = min(image.shape[0], max(p[1] + p[3] for p in points) + 55)
# Force a generous square crop around the marker cluster.
cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
size = max(x2 - x1, y2 - y1)
x1 = max(0, cx - size // 2); y1 = max(0, cy - size // 2)
x2 = min(image.shape[1], x1 + size); y2 = min(image.shape[0], y1 + size)
x1 = max(0, x2 - size); y1 = max(0, y2 - size)
crop = image[y1:y2, x1:x2]
if crop.size == 0:
    raise SystemExit('QR crop is empty')
cv2.imwrite(str(out), crop, [cv2.IMWRITE_PNG_COMPRESSION, 3])
print({'source': str(src), 'output': str(out), 'crop': [int(x1), int(y1), int(x2), int(y2)], 'markers': len(points), 'shape': list(crop.shape)})
