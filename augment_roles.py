import re
import json

def augment_array(roles):
    # Add generic roles to make it up to 10
    generics = ["คนทำความสะอาด", "ยามรักษาความปลอดภัย", "ช่างซ่อมบำรุง", "ลูกค้าขาจร", "พนักงานฝึกหัด", "ผู้จัดการทั่วไป", "ผู้ช่วย", "คนขับรถ", "ผู้สังเกตการณ์", "นักท่องเที่ยว"]
    new_roles = list(roles)
    for g in generics:
        if len(new_roles) >= 10:
            break
        if g not in new_roles:
            new_roles.append(g)
    return new_roles

# Read categories.js
with open('categories.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find all arrays of roles: r:["..."]
# Pattern: r:\[(.*?)\]
def replacer(match):
    arr_str = match.group(1)
    # Parse the array manually
    # it looks like "Role1","Role2"
    items = [x.strip().strip('"\'') for x in arr_str.split(',')]
    augmented = augment_array(items)
    return 'r:[' + ','.join(f'"{x}"' for x in augmented) + ']'

new_content = re.sub(r'r:\[(.*?)\]', replacer, content)

with open('categories.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Read app.js and do the same for DEFAULT_LOCATIONS
with open('app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Find DEFAULT_LOCATIONS object
start_idx = app_content.find('const DEFAULT_LOCATIONS = {')
end_idx = app_content.find('};', start_idx) + 2

default_locs_str = app_content[start_idx:end_idx]
new_default_locs_str = re.sub(r'\[(.*?)\]', lambda m: '[' + ','.join(f"'{x}'" for x in augment_array([y.strip().strip('"\'') for y in m.group(1).split(',')])) + ']', default_locs_str)

app_content = app_content.replace(default_locs_str, new_default_locs_str)

# Same for NON_STANDARD_LOCATIONS
start_idx2 = app_content.find('const NON_STANDARD_LOCATIONS = {')
end_idx2 = app_content.find('};', start_idx2) + 2

non_std_locs_str = app_content[start_idx2:end_idx2]
new_non_std_locs_str = re.sub(r'\[(.*?)\]', lambda m: '[' + ','.join(f"'{x}'" for x in augment_array([y.strip().strip('"\'') for y in m.group(1).split(',') if y.strip()])) + ']', non_std_locs_str)

app_content = app_content.replace(non_std_locs_str, new_non_std_locs_str)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)
