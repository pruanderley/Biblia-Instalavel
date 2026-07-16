#!/usr/bin/env python3
"""
Patcha o AndroidManifest.xml gerado pelo Capacitor para adicionar:
- Permissões de ForegroundService
- Declaração do AudioForegroundService
"""
import sys

MANIFEST = "android/app/src/main/AndroidManifest.xml"

with open(MANIFEST, "r", encoding="utf-8") as f:
    content = f.read()

# ── Permissões ────────────────────────────────────────────────
perms = [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    'android.permission.WAKE_LOCK',
]
for perm in perms:
    tag = f'<uses-permission android:name="{perm}"/>'
    if tag not in content:
        # Insere antes de </manifest>
        content = content.replace("</manifest>", f'    {tag}\n</manifest>', 1)
        print(f"  + {perm}")
    else:
        print(f"  = {perm} (já existe)")

# ── Declaração do Service ─────────────────────────────────────
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

with open(MANIFEST, "w", encoding="utf-8") as f:
    f.write(content)

print("AndroidManifest.xml patchado com sucesso!")
