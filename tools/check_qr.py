from pathlib import Path
import cv2

path = Path('/home/ubuntu/paizomath-contact-work/images/paypal-qr-only.png')
image = cv2.imread(str(path))
if image is None:
    raise SystemExit('asset missing')
detector = cv2.QRCodeDetector()
value, points, _ = detector.detectAndDecode(image)
print({'asset': str(path), 'decoded': bool(value), 'value': value, 'width': image.shape[1], 'height': image.shape[0]})
