// NOTE: This is a pure JavaScript version of the frontend's constants file,
// with TypeScript types removed so it can be run by a Node.js script.

export const EXERCISES = [
  {
    id: 'crunch',
    title: 'Crunch',
    group: 'abs',
    imageUri:
      'https://hips.hearstapps.com/hmg-prod/images/fitness-woman-doing-abs-crunches-royalty-free-image-579128718-1551795417.jpg?resize=640:*',
    description:
      'Acostado boca arriba, flexiona el tronco elevando los hombros. Mantén el core activado y evita tirar del cuello.',
  },
  {
    id: 'plank',
    title: 'Plancha',
    group: 'abs',
    imageUri: 'https://i.blogs.es/c77dd8/plancha1/840_560.jpeg',
    description:
      'Mantén el cuerpo en línea recta apoyado en antebrazos y puntas de pies. Activa abdomen y glúteos.',
  },
  {
    id: 'bench-press',
    title: 'Press banca',
    group: 'chest',
    imageUri:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
    description:
      'En banco plano, desciende la barra hacia el pecho y empuja hacia arriba con control. Escápulas retraídas.',
  },
  {
    id: 'push-up',
    title: 'Flexiones',
    group: 'chest',
    imageUri:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
    description:
      'Con manos al ancho de hombros, desciende el pecho hacia el suelo y empuja manteniendo el core firme.',
  },
  {
    id: 'barbell-curl',
    title: 'Curl con barra',
    group: 'biceps',
    imageUri:
      'https://www.titaniumstrength.es/blog/wp-content/uploads/2022/06/preacher-curl-variation.png',
    description:
      'De pie, flexiona los codos llevando la barra hacia los hombros. Evita balancear el torso.',
  },
  {
    id: 'hammer-curl',
    title: 'Curl martillo',
    group: 'biceps',
    imageUri:
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200&auto=format&fit=crop',
    description:
      'Sujeta mancuernas en agarre neutro y flexiona los codos. Enfocado en braquiorradial y bíceps.',
  },
  // Glúteos
  {
    id: 'glute-bridge',
    title: 'Puente de glúteos',
    group: 'glutes',
    imageUri:
      'https://cdn.media.amplience.net/i/thegymgroup/The_Gym_Group-Exercises-How_To_Do_A_Glute_Bridge-Step_By_Step_4?fmt=auto&h=250&w=412&sm=c&qlt=default&$qlt$&$poi$',
    description:
      'Acostado boca arriba con rodillas flexionadas, eleva las caderas contrayendo glúteos. Mantén el abdomen activo.',
  },
  {
    id: 'hip-thrust',
    title: 'Hip thrust',
    group: 'glutes',
    imageUri:
      'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?q=80&w=1200&auto=format&fit=crop',
    description:
      'Con espalda apoyada en un banco, eleva caderas con barra o peso, haciendo énfasis en la contracción de glúteos.',
  },
  // Cuádriceps
  {
    id: 'squat',
    title: 'Sentadilla',
    group: 'quadriceps',
    imageUri:
      'https://st3.depositphotos.com/12985848/16918/i/450/depositphotos_169181914-stock-photo-sportsman-lifting-barbell.jpg',
    description:
      'Con pies al ancho de hombros, desciende caderas manteniendo espalda recta. Empuja el suelo para subir.',
  },
  {
    id: 'leg-extension',
    title: 'Extensión de piernas',
    group: 'quadriceps',
    imageUri:
      'https://media.istockphoto.com/id/1287874606/photo/muscular-man-using-weights-machine-for-legs-at-the-gym-hard-training.jpg?s=612x612&w=0&k=20&c=dOU3rsfCKO_9XvfgNqJ4wJA6ZIdI3BLAgpAFomEgR54=',
    description:
      'En máquina de extensión, eleva las piernas extendiendo rodillas y controla la bajada. Enfoque en cuádriceps.',
  },
  // Gemelos
  {
    id: 'calf-raise-standing',
    title: 'Elevación de talones de pie',
    group: 'calves',
    imageUri:
      'https://as01.epimg.net/deporteyvida/imagenes/2020/12/09/portada/1607504260_451286_1607504315_noticia_normal.jpg',
    description:
      'De pie, eleva los talones contrayendo gemelos y controla el descenso completo para mayor rango.',
  },
  {
    id: 'jump-rope',
    title: 'Saltar la cuerda',
    group: 'calves',
    imageUri:
      'https://media.istockphoto.com/id/533446895/photo/muscular-man-skipping-rope.jpg?s=612x612&w=0&k=20&c=MqL2Xf3TGAliozdP3NGgt6x58HWSr4duJ7pHzx8neGs=',
    description:
      'Ejercicio cardiovascular que enfatiza gemelos: salta con ritmo constante, aterrizando suave en la punta de los pies. Mantén el core activo y la cuerda girando desde las muñecas.',
  },
  // Nuevos ejercicios (ABS)
  {
    id: 'bicycle-crunch',
    title: 'Bicycle crunch',
    group: 'abs',
    imageUri: 'https://barbend.com/wp-content/uploads/2023/07/bicycle-crunch-workout-barbend.com_.jpg',
    description: 'Desde posición supina, alterna flexión de tronco llevando codo a rodilla contraria en movimiento controlado. Activa oblicuos y evita tirar del cuello.',
  },
  {
    id: 'mountain-climber',
    title: 'Mountain climber',
    group: 'abs',
    imageUri: 'https://www.endomondo.com/wp-content/uploads/2024/08/feature-2024-08-08-1.jpg',
    description: 'En posición de plancha alta, lleva rodillas alternadas hacia el pecho a ritmo moderado manteniendo abdomen firme y caderas estables.',
  },
  // Nuevos ejercicios (CHEST)
  {
    id: 'incline-dumbbell-press',
    title: 'Press inclinado mancuerna',
    group: 'chest',
    imageUri: 'https://vitalnutrition.nl/cdn/shop/articles/incline-dumbbell-press_40c87738-25c8-4b2b-b156-33ca3976cf9f.png?v=1756132128&width=1100',
    description: 'En banco inclinado (30–45°), desciende las mancuernas al nivel del pecho superior y presiona hacia arriba juntando ligeramente sin golpear.',
  },
  {
    id: 'chest-dip',
    title: 'Fondos en paralelas (pecho)',
    group: 'chest',
    imageUri: 'https://www.shutterstock.com/image-photo/muscular-athlete-performing-bodyweight-training-600nw-2579673745.jpg',
    description: 'Inclina ligeramente el torso hacia delante durante el fondo para enfatizar pectorales; baja controlado y empuja extendiendo codos sin bloquearlos bruscamente.',
  },
  // Nuevos ejercicios (BICEPS)
  {
    id: 'concentration-curl',
    title: 'Curl concentración',
    group: 'biceps',
    imageUri: 'https://www.shutterstock.com/image-photo/strong-muscular-sportsman-sitting-gym-600nw-2296466915.jpg',
    description: 'Sentado con codo apoyado en el muslo interno, flexiona llevando la mancuerna hacia el hombro aislando el bíceps; evita mover el hombro.',
  },
  {
    id: 'preacher-curl',
    title: 'Curl predicador',
    group: 'biceps',
    imageUri: 'https://www.barankalayci.com/Images/Assets/Blogs/01121/preacher-curl-nedir-nasil-yapilir-ne-ise-yarar--cover-image.webp',
    description: 'En banco predicador, extiende casi por completo y flexiona controladamente evitando balanceo. Foco en la porción larga del bíceps.',
  },
  // Nuevos ejercicios (GLUTES)
  {
    id: 'single-leg-glute-bridge',
    title: 'Puente de glúteos unilateral',
    group: 'glutes',
    imageUri: 'https://www.onnit.com/cdn/shop/articles/how-to-do-the-single-leg-glute-bridge-article-1680x1138-1_7893ca27-c4b7-4736-bc73-71b45c96ed6b.jpg?v=1755199506&width=1260',
    description: 'Desde puente, extiende una pierna y eleva caderas manteniendo pelvis estable; aumenta activación de glúteo mayor y estabilidad.',
  },
  {
    id: 'donkey-kick',
    title: 'Patada de burro',
    group: 'glutes',
    imageUri: 'https://images.ctfassets.net/hjcv6wdwxsdz/4Ua8AujzMcgczrYzUIKQOO/9dc2f1879cbfacaf285021502d7fc9e4/Woman-on-top-of-yoga-mat-doing-donkey-kicks.png',
    description: 'En cuadrupedia, eleva la pierna flexionada empujando el talón hacia el techo sin arquear la zona lumbar excesivamente.',
  },
  // Nuevos ejercicios (QUADRICEPS)
  {
    id: 'lunge',
    title: 'Zancada (lunge)',
    group: 'quadriceps',
    imageUri: 'https://assets.clevelandclinic.org/transform/282b2789-82f6-4759-b42e-a441348f7cb8/lunge-1322900654',
    description: 'Da un paso al frente y desciende hasta que ambas rodillas formen ángulos cercanos a 90°. Empuja con la pierna frontal para volver.',
  },
  {
    id: 'leg-press',
    title: 'Prensa de piernas',
    group: 'quadriceps',
    imageUri: 'https://media.istockphoto.com/id/1286549298/photo/bodybuilder-doing-a-seated-leg-press-exercise-in-a-gym.jpg?s=612x612&w=0&k=20&c=RsOFVbwaXLlL_qXeTY-pk47B8HdnHO2s08AQdiQLuuU=',
    description: 'En prensa, desciende la plataforma controladamente manteniendo rodillas alineadas; empuja sin bloquear completamente las articulaciones.',
  },
  // Nuevos ejercicios (CALVES)
  {
    id: 'seated-calf-raise',
    title: 'Elevación de talones sentado',
    group: 'calves',
    imageUri: 'https://i5.walmartimages.com/seo/Seated-Calf-Raise-Machine-Home-Gym-Leg-Exercise-Equipment-Calves-440-LBS-Capacity-5-Level-Height-4-Level-Handle-Adjustment-Heavy-Duty-Steel-Construct_1b1191c2-8995-4948-9055-a4dc8ca6f115.a31a43c34cbd135508fe3c4ea153ddc9.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF',
    description: 'Sentado en máquina o con soporte en muslos, eleva talones enfocando más el sóleo; pausa breve arriba y baja lento.',
  },
  {
    id: 'single-leg-calf-raise',
    title: 'Elevación de talón unilateral',
    group: 'calves',
    imageUri: 'https://images.squarespace-cdn.com/content/v1/5f5e8592d2b0854b18af6975/342009fc-240b-4a9c-8f74-6bd94fe2decb/slant+board+single+leg+calf+raise.jpg',
    description: 'En apoyo de una pierna, eleva el talón para mayor énfasis y equilibrio. Mantén control del descenso para rango completo.',
  },
];

export const EXERCISE_MAP = EXERCISES.reduce((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});

export function getExerciseById(id) {
  if (!id) return undefined;
  return EXERCISE_MAP[id];
}
