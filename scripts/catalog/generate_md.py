import json

products = [
    {
        "title": "R Cam Coil (J)",
        "short_desc": "High-quality R Cam Coil (J) component.",
        "desc": "Reliable and durable R Cam Coil (J), engineered for precision and longevity in elevator systems. Ensures smooth mechanical operation and is built to withstand continuous use.",
        "slug": "r-cam-coil-j",
        "sku": "RCC-J-001",
        "price": 1500,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "OSG Limit Switch",
        "short_desc": "Essential OSG Limit Switch for elevator safety.",
        "desc": "The OSG Limit Switch is a critical safety component designed to detect and limit overspeed conditions in elevator systems. Provides dependable performance for enhanced passenger safety.",
        "slug": "osg-limit-switch",
        "sku": "OSG-LS-001",
        "price": 150,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Forged Clip",
        "short_desc": "Heavy-duty Forged Clip for guide rails.",
        "desc": "Durable forged clips designed for secure fastening of elevator guide rails. Manufactured from high-strength materials to ensure structural integrity and precise alignment.",
        "slug": "forged-clip",
        "sku": "FC-VAR-001",
        "price": 20,
        "app_id": "e58f423c-8e2c-4835-8344-9ac12fecc6b1",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049",
        "variants": [
            {"title": "5mm", "price": 20},
            {"title": "9mm", "price": 25},
            {"title": "16mm", "price": 32}
        ]
    },
    {
        "title": "Bulldog Clip",
        "short_desc": "Sturdy Bulldog Clip for wire ropes.",
        "desc": "Premium bulldog clips specifically designed for securing and terminating wire ropes in elevator systems. Ensures a firm, slip-resistant grip for maximum safety.",
        "slug": "bulldog-clip",
        "sku": "BDC-VAR-001",
        "price": 24,
        "app_id": "e58f423c-8e2c-4835-8344-9ac12fecc6b1",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049",
        "variants": [
            {"title": "8mm", "price": 24},
            {"title": "10mm", "price": 32},
            {"title": "13mm", "price": 37}
        ]
    },
    {
        "title": "I Bolt Thimble Sheet Metal",
        "short_desc": "High-strength I Bolt Thimble for wire ropes.",
        "desc": "Durable sheet metal I bolt thimble designed to protect wire ropes from wear and deformation at connection points. Essential for maintaining rope integrity in elevator systems.",
        "slug": "i-bolt-thimble-sheet-metal",
        "sku": "IBT-SM-VAR-001",
        "price": 250,
        "app_id": "e58f423c-8e2c-4835-8344-9ac12fecc6b1",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049",
        "variants": [
            {"title": "8mm", "price": 250},
            {"title": "10mm", "price": 280},
            {"title": "13mm", "price": 280}
        ]
    },
    {
        "title": "R. Cam Set (J)",
        "short_desc": "Complete R. Cam Set (J) assembly.",
        "desc": "Comprehensive R. Cam Set (J) designed for reliable mechanical interlocking in elevator systems. Built to precise specifications for optimal performance.",
        "slug": "r-cam-set-j",
        "sku": "RCS-J-001",
        "price": 3600,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "R. Cam Set (S)",
        "short_desc": "Complete R. Cam Set (S) assembly.",
        "desc": "Comprehensive R. Cam Set (S) providing reliable mechanical synchronization and interlocking. Ensures smooth and safe operation.",
        "slug": "r-cam-set-s",
        "sku": "RCS-S-001",
        "price": 3200,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Fermator Track Roller",
        "short_desc": "Smooth-rolling Track Roller for Fermator doors.",
        "desc": "High-quality replacement track roller for Fermator elevator doors. Ensures quiet, smooth, and reliable door operation while reducing wear on tracks.",
        "slug": "fermator-track-roller",
        "sku": "FTR-001",
        "price": 270,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Fermator Belt M5-HTD",
        "short_desc": "Durable M5-HTD Belt for Fermator doors.",
        "desc": "Heavy-duty M5-HTD timing belt designed specifically for Fermator elevator door mechanisms. Provides precise power transmission and long service life.",
        "slug": "fermator-belt-m5-htd",
        "sku": "FB-M5HTD-001",
        "price": 175,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Fermator Belt M5-Eagle",
        "short_desc": "Premium M5-Eagle Belt for Fermator doors.",
        "desc": "Premium quality M5-Eagle replacement belt for Fermator doors. Engineered for low noise, high efficiency, and exceptional durability in high-traffic elevators.",
        "slug": "fermator-belt-m5-eagle",
        "sku": "FB-M5EAGLE-001",
        "price": 550,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Fermator Spring Clamp",
        "short_desc": "Reliable Spring Clamp for Fermator assemblies.",
        "desc": "Sturdy spring clamp designed for secure fastening within Fermator door systems. Ensures components remain tightly aligned during operation.",
        "slug": "fermator-spring-clamp",
        "sku": "FSC-001",
        "price": 10,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Fermator D-Lock",
        "short_desc": "Secure D-Lock mechanism for Fermator doors.",
        "desc": "Robust D-Lock assembly for Fermator elevator doors. Provides essential mechanical locking to ensure passenger safety and prevent unauthorized access.",
        "slug": "fermator-d-lock",
        "sku": "FDL-001",
        "price": 180,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Fermator Auto Door Key",
        "short_desc": "Standard Auto Door Key for Fermator.",
        "desc": "Reliable auto door key designed for manual override and servicing of Fermator automatic elevator doors. Essential tool for maintenance personnel.",
        "slug": "fermator-auto-door-key",
        "sku": "FADK-001",
        "price": 65,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Contact Switch U-Type",
        "short_desc": "Dependable U-Type Contact Switch.",
        "desc": "High-quality U-Type contact switch for precise electrical signaling in elevator doors and safety circuits. Engineered for consistent performance.",
        "slug": "contact-switch-u-type",
        "sku": "CS-UTYPE-001",
        "price": 250,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Contact Switch V-Type",
        "short_desc": "Dependable V-Type Contact Switch.",
        "desc": "Robust V-Type contact switch designed for elevator safety and control systems. Provides accurate switching in demanding environments.",
        "slug": "contact-switch-v-type",
        "sku": "CS-VTYPE-001",
        "price": 220,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Contact Switch Suns",
        "short_desc": "Premium Suns Contact Switch.",
        "desc": "Heavy-duty Suns contact switch for reliable electrical connections in critical elevator safety circuits. Ensures fast and accurate response.",
        "slug": "contact-switch-suns",
        "sku": "CS-SUNS-001",
        "price": 650,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Contact Switch Car",
        "short_desc": "Specialized Car Contact Switch.",
        "desc": "Durable contact switch designed specifically for elevator car applications. Maintains precise electrical contact during car movement and door operation.",
        "slug": "contact-switch-car",
        "sku": "CS-CAR-001",
        "price": 550,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Contact Switch Landing",
        "short_desc": "Specialized Landing Contact Switch.",
        "desc": "High-reliability contact switch engineered for elevator landing doors. Ensures accurate floor sensing and safe door interlocking.",
        "slug": "contact-switch-landing",
        "sku": "CS-LANDING-001",
        "price": 550,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Door Hanger Bolt 110",
        "short_desc": "Strong Door Hanger Bolt.",
        "desc": "High-strength door hanger bolt designed to securely mount elevator doors to the hanger mechanism. Built to endure heavy loads.",
        "slug": "door-hanger-bolt-110",
        "sku": "DHB-110-001",
        "price": 110,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Hanger Clip",
        "short_desc": "Secure Hanger Clip for door panels.",
        "desc": "Sturdy hanger clip for securing elevator door panels to the hanger assembly. Maintains alignment and prevents panel shifting.",
        "slug": "hanger-clip",
        "sku": "HC-001",
        "price": 50,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Door Hanger Bolt 80",
        "short_desc": "Standard Door Hanger Bolt.",
        "desc": "Durable door hanger bolt for standard elevator door installations. Ensures safe and secure attachment to the hanger track.",
        "slug": "door-hanger-bolt-80",
        "sku": "DHB-80-001",
        "price": 80,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Bottom Sil (TC)",
        "short_desc": "Durable Bottom Sill (TC) guide.",
        "desc": "Heavy-duty bottom sill (TC) designed to provide a smooth, wear-resistant guide for elevator doors. Ensures reliable alignment.",
        "slug": "bottom-sil-tc",
        "sku": "BS-TC-001",
        "price": 800,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Bottom Sil (CO)",
        "short_desc": "Durable Bottom Sill (CO) guide.",
        "desc": "Robust bottom sill (CO) component that guides elevator doors smoothly along their path. Built for high traffic and longevity.",
        "slug": "bottom-sil-co",
        "sku": "BS-CO-001",
        "price": 850,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "Gate Lock (O)",
        "short_desc": "Secure Gate Lock (O) for landings.",
        "desc": "Dependable Gate Lock (O) designed to prevent elevator doors from opening when the car is not present. Essential for passenger safety.",
        "slug": "gate-lock-o",
        "sku": "GL-O-001",
        "price": 870,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Gate Lock (Ex)",
        "short_desc": "Premium Gate Lock (Ex) mechanism.",
        "desc": "Advanced Gate Lock (Ex) mechanism providing superior security and interlocking for elevator doors. Highly durable construction.",
        "slug": "gate-lock-ex",
        "sku": "GL-EX-001",
        "price": 580,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Gate Lock (IMP)",
        "short_desc": "Heavy-duty Gate Lock (IMP).",
        "desc": "Industrial-grade Gate Lock (IMP) for high-capacity elevators. Offers maximum safety and robust interlocking performance.",
        "slug": "gate-lock-imp",
        "sku": "GL-IMP-001",
        "price": 1450,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Gate Lock (BBL)",
        "short_desc": "Standard Gate Lock (BBL).",
        "desc": "Reliable Gate Lock (BBL) designed for secure elevator door operation. Compliant with strict safety standards.",
        "slug": "gate-lock-bbl",
        "sku": "GL-BBL-001",
        "price": 860,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Inspection + Junction Box",
        "short_desc": "Combined Inspection and Junction Box.",
        "desc": "Integrated inspection and junction box for elevator maintenance. Provides convenient access to controls and wiring securely.",
        "slug": "inspection-junction-box",
        "sku": "IJB-001",
        "price": 720,
        "app_id": "aeb4490f-ad85-4940-af24-5e02ee10c7f2",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Inspection Box",
        "short_desc": "Standard Inspection Box.",
        "desc": "Dedicated inspection box for safe and efficient elevator maintenance control. Features durable housing and reliable switches.",
        "slug": "inspection-box",
        "sku": "IB-001",
        "price": 380,
        "app_id": "aeb4490f-ad85-4940-af24-5e02ee10c7f2",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Pit Switch",
        "short_desc": "Essential Pit Safety Switch.",
        "desc": "Crucial pit switch designed to immediately stop elevator operation for personnel safety during pit maintenance.",
        "slug": "pit-switch",
        "sku": "PS-001",
        "price": 120,
        "app_id": "aeb4490f-ad85-4940-af24-5e02ee10c7f2",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Emergency Alarm with Battery",
        "short_desc": "Battery-backed Emergency Alarm.",
        "desc": "Reliable emergency alarm system equipped with a backup battery. Ensures passenger communication capability even during power failures.",
        "slug": "emergency-alarm-with-battery",
        "sku": "EA-BAT-001",
        "price": 250,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Fireman's Switch (SS)",
        "short_desc": "Stainless Steel Fireman's Switch.",
        "desc": "Durable stainless steel fireman's switch for emergency elevator recall. Built to withstand harsh conditions and ensure reliable activation.",
        "slug": "firemans-switch-ss",
        "sku": "FS-SS-001",
        "price": 250,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Fireman's Switch (MS)",
        "short_desc": "Mild Steel Fireman's Switch.",
        "desc": "Robust mild steel fireman's switch for emergency operations. Provides dependable control during fire emergencies.",
        "slug": "firemans-switch-ms",
        "sku": "FS-MS-001",
        "price": 220,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    },
    {
        "title": "Pencil Reed Switch (NO)",
        "short_desc": "Normally Open Pencil Reed Switch.",
        "desc": "Precise Normally Open (NO) pencil reed switch for elevator position sensing and control circuits. Highly responsive and durable.",
        "slug": "pencil-reed-switch-no",
        "sku": "PRS-NO-001",
        "price": 90,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Pencil Reed Switch (NC)",
        "short_desc": "Normally Closed Pencil Reed Switch.",
        "desc": "Precise Normally Closed (NC) pencil reed switch, essential for failsafe signaling and positioning in elevator systems.",
        "slug": "pencil-reed-switch-nc",
        "sku": "PRS-NC-001",
        "price": 220,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "J Bolt Patta",
        "short_desc": "Sturdy J Bolt Patta.",
        "desc": "High-strength J Bolt Patta used for secure mechanical anchoring in elevator installations. Built to bear heavy loads reliably.",
        "slug": "j-bolt-patta",
        "sku": "JBP-001",
        "price": 75,
        "app_id": "e58f423c-8e2c-4835-8344-9ac12fecc6b1",
        "cat_id": "b4acb49d-3230-43ad-9933-0a2e3d285049"
    },
    {
        "title": "PVC Truffing 45x45",
        "short_desc": "Protective PVC Truffing 45x45.",
        "desc": "Durable 45x45 PVC truffing for organizing and protecting electrical wiring in elevator shafts. Prevents damage and wear.",
        "slug": "pvc-truffing-45x45",
        "sku": "PVC-T-45-001",
        "price": 140,
        "app_id": "e58f423c-8e2c-4835-8344-9ac12fecc6b1",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517"
    },
    {
        "title": "Magnet",
        "short_desc": "Strong sensing magnet.",
        "desc": "High-strength magnet used in conjunction with reed switches for precise elevator car positioning and leveling.",
        "slug": "magnet",
        "sku": "MAG-VAR-001",
        "price": 13,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "0c0fa975-37b0-480c-b7ed-09e2cd06c517",
        "variants": [
            {"title": "40x25x10", "price": 13},
            {"title": "100x20x8", "price": 13}
        ]
    },
    {
        "title": "SFT Door Sensor",
        "short_desc": "Advanced SFT Door Sensor.",
        "desc": "State-of-the-art SFT door sensor for highly responsive obstruction detection. Maximizes passenger safety during door operation.",
        "slug": "sft-door-sensor",
        "sku": "SFT-DS-001",
        "price": 3300,
        "app_id": "93c7ad59-32c7-4bd3-8961-b35ef6530b19",
        "cat_id": "f30d1984-8a45-47e3-817a-265949b9dadd"
    }
]

with open("d:\\web development\\cedarelevators\\enriched-product-data.md", "w") as f:
    f.write("# Enriched Product Data - Complete\\n\\n")
    for i, p in enumerate(products, 1):
        f.write(f"## Product {i}\\n")
        f.write("### 1. Basic Product Details\\n")
        f.write(f"- **Product Title**: {p['title']}\\n")
        f.write(f"- **Short Description**: {p['short_desc']}\\n")
        f.write(f"- **Full Description**: {p['desc']}\\n")
        f.write(f"- **Slug**: {p['slug']}\\n")
        f.write(f"- **SKU**: {p['sku']}\\n")
        f.write(f"- **Status**: active\\n\\n")
        
        f.write("### 2. Pricing & Inventory\\n")
        if 'variants' in p:
            f.write(f"- **Price**: {p['variants'][0]['price']}\\n")
            f.write(f"- **MRP / Compare at Price**: {p['variants'][0]['price']}\\n")
        else:
            f.write(f"- **Price**: {p['price']}\\n")
            f.write(f"- **MRP / Compare at Price**: {p['price']}\\n")
        f.write("- **Cost per Item**: \\n")
        f.write("- **Track Inventory**: True\\n")
        f.write("- **Stock Quantity**: 50\\n")
        f.write("- **Low Stock Threshold**: 10\\n")
        f.write("- **Allow Backorder**: False\\n\\n")

        f.write("### 3. Catalog & Classification\\n")
        f.write(f"- **Application**: {p['app_id']}\\n")
        f.write(f"- **Category**: {p['cat_id']}\\n\\n")

        f.write("### 4. Search Engine Optimization (SEO)\\n")
        f.write(f"- **Meta Title**: {p['title']} - Premium Elevator Component\\n")
        f.write(f"- **Meta Description**: Shop {p['title']}. High quality and reliable components for safe elevator operation.\\n\\n")

        if 'variants' in p:
            f.write("### 6. Product Variants\\n")
            for j, v in enumerate(p['variants'], 1):
                f.write(f"- **Variant {j}**:\\n")
                f.write(f"  - **Variant Title**: {v['title']} {p['title']}\\n")
                f.write(f"  - **Option 1 Name & Value**: Size: {v['title']}\\n")
                f.write(f"  - **Variant Price**: {v['price']}\\n")
                f.write(f"  - **Variant Stock**: 50\\n")
            f.write("\\n")
        f.write("---\\n\\n")

print("Generated enriched-product-data.md successfully.")
