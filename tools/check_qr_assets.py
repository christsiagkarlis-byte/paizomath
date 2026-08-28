from pathlib import Path
import cv2

for path in [Path('/home/ubuntu/paizomath-contact-work/images/paypal-tip-qr-xristos-tsiagkarlis.jpg'), Path('/home/ubuntu/paizomath-contact-work/images/paypal-qr-scan.png'), Path('/home/ubuntu/paizomath-contact-work/images/paypal-qr-only.png')]:
    image = cv2.imread(str(path))
    detector = cv2.QRCodeDetector()
    value, points, _ = detector.detectAndDecode(image)
    print(path.name, {'decoded': bool(value), 'value': value, 'shape': list(image.shape) if image is not None else None, 'points': points.tolist() if points is not None else None})
