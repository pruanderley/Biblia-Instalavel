#!/usr/bin/env python3
"""Patcha o AndroidManifest.xml gerado pelo Capacitor."""

MANIFEST = "android/app/src/main/AndroidManifest.xml"

with open(MANIFEST, "r", encoding="utf-8") as f:
    content = f.read()

perms = [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    'android.permission.WAKE_LOCK',
]
for perm in perms:
    tag = f'<uses-permission android:name="{perm}"/>'
    if tag not in content:
        content = content.replace("</manifest>", f'    {tag}\n</manifest>', 1)
        print(f"  + {perm}")
    else:
        print(f"  = {perm} (já existe)")

service_tag = '<service android:name=".AudioForegroundService"'
if service_tag not in content:
    service_decl = (
        '        <service\n'
        '            android:name=".AudioForegroundService"\n'
        '            android:enabled="true"\n'
        '            android:exported="false"\n'
        '            android:foregroundServiceType="mediaPlayback"/>\n'
    )
    content = content.replace("</application>", service_decl + "    </application>", 1)
    print("  + AudioForegroundService declarado")
else:
    print("  = AudioForegroundService (já existe)")

# ── FileProvider próprio para compartilhar imagem do versículo ──
import os
if 'com.biblia.sharefiles' not in content and '.sharefiles' not in content:
    provider = (
        '        <provider\n'
        '            android:name="androidx.core.content.FileProvider"\n'
        '            android:authorities="${applicationId}.sharefiles"\n'
        '            android:exported="false"\n'
        '            android:grantUriPermissions="true">\n'
        '            <meta-data\n'
        '                android:name="android.support.FILE_PROVIDER_PATHS"\n'
        '                android:resource="@xml/share_paths"/>\n'
        '        </provider>\n'
    )
    content = content.replace("</application>", provider + "    </application>", 1)
    print("  + FileProvider sharefiles declarado")
xml_dir = "android/app/src/main/res/xml"
os.makedirs(xml_dir, exist_ok=True)
with open(xml_dir + "/share_paths.xml", "w", encoding="utf-8") as xf:
    xf.write('<?xml version="1.0" encoding="utf-8"?>\n<paths>\n    <cache-path name="shared" path="shared/"/>\n</paths>\n')

with open(MANIFEST, "w", encoding="utf-8") as f:
    f.write(content)

print("AndroidManifest.xml patchado com sucesso!")
