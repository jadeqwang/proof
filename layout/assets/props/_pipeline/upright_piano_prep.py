import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=a[0])
for m in bpy.data.materials:
    n = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
    if m.name == 'Plywood' and n: n.inputs['Base Color'].default_value = (0.02, 0.02, 0.02, 1)  # unfinished back -> black like the case
    if n: print('MAT', m.name, tuple(round(x,3) for x in n.inputs['Base Color'].default_value), round(n.inputs['Roughness'].default_value,2), round(n.inputs['Metallic'].default_value,2))
bpy.ops.export_scene.gltf(filepath=a[1], export_format='GLB', export_yup=True, export_animations=False)
