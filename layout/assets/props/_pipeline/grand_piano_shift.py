import bpy, sys, mathutils
a = sys.argv[sys.argv.index('--') + 1:]; src, dst = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
ms = [o for o in bpy.data.objects if o.type == 'MESH']
ymin = min((o.matrix_world @ v.co).y for o in ms for v in o.data.vertices)   # Blender -y = glTF +z = keyboard front
print('SHIFT front edge (glTF z) =', -ymin)
for o in ms:
    o.data.transform(o.matrix_world); o.matrix_world = mathutils.Matrix()
    o.data.transform(mathutils.Matrix.Translation((0, -ymin, 0)))
for m in bpy.data.materials:
    n = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
    print('MAT', m.name, tuple(round(x, 3) for x in n.inputs['Base Color'].default_value) if n else None, [l.from_node.type for l in n.inputs['Base Color'].links] if n else None)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_yup=True, export_animations=False)
