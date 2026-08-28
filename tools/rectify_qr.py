from pathlib import Path
import cv2
import numpy as np

src = Path('/home/ubuntu/paizomath-contact-work/images/paypal-tip-qr-xristos-tsiagkarlis.jpg')
out = src.with_name('paypal-qr-only.png')
image = cv2.imread(str(src))
if image is None:
    raise SystemExit('source missing')
# QR quadrilateral detected in the supplied photograph.
points = np.float32([[297, 977], [977, 971], [1105, 1820], [303, 1657]])
size = 1000
margin = 48
destination = np.float32([[margin, margin], [size-margin, margin], [size-margin, size-margin], [margin, size-margin]])
matrix = cv2.getPerspectiveTransform(points, destination)
warped = cv2.warpPerspective(image, matrix, (size, size), borderMode=cv2.BORDER_CONSTANT, borderValue=(255,255,255))
cv2.imwrite(str(out), warped, [cv2.IMWRITE_PNG_COMPRESSION, 3])
value, detected, _ = cv2.QRCodeDetector().detectAndDecode(warped)
print({'output': str(out), 'decoded': bool(value), 'value': value, 'size': size})
