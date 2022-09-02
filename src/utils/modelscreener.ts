import { tree } from 'd3'
import {
  Camera,
  Group,
  Scene,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  EquirectangularRefractionMapping,
  TextureLoader,
  Texture,
  OrthographicCamera,
  Box3,
  Vector3,
  Mesh,
  Material,
  ShaderMaterial
} from 'three'

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { studioEnvMap } from './imageData'

export default class ModelScreener {
  /**
   *
   * @param object
   * @param camera
   * @returns image in base64
   */
  public static captureImage (
    object: Group,
    camera: Camera,
    size?: { width: number; height: number }
  ): string {
    const scene = new Scene()
    const render = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })

    const clone = object.clone()

    const shader = {
      vertex: `
            varying vec3 pos;

            void main() {
                vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                pos = position;
                gl_Position = p;
            }
        `,
      fragment: `
        varying vec3 pos;

        uniform float top;
        uniform float bottom;

        void main() {
            float depth = (pos.y+bottom)/(top-bottom);
            depth = 0.3f + depth*0.4f;
            gl_FragColor = vec4(depth, depth, depth, 1);
            // gl_FragColor = vec4(0.0f,pos.y,0.0f,1.0f);
        }
        `
    }

    const box = new Box3()
    box.setFromObject(object)
    const s = new Vector3()
    const c = new Vector3()
    box.getSize(s)
    box.getCenter(c)

    const mat = new ShaderMaterial({
      uniforms: {
        top: { value: c.y + s.y / 2 },
        bottom: { value: c.y - s.y / 2 }
      },
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment
    })

    clone.traverse(obj => {
      if (obj instanceof Mesh) {
        obj.material = mat
      }
    })
    scene.add(clone)
    render.setClearColor(0x000000, 0)
    const ambiant = new AmbientLight(0xaaaaaa)
    scene.add(ambiant)
    const sun = new DirectionalLight(0xffffff, 0.9)
    sun.position.set(9, 10, 10)
    // scene.add(sun)
    this.setEnvMap(scene, studioEnvMap, 'HDR')

    if (size === undefined) {
      render.setSize(s.x * 100, s.z * 100)
    } else {
      render.setSize(size.width, size.height)
    }

    render.render(scene, camera)
    const strMime = 'image/png'
    const imageData = render.domElement.toDataURL(strMime)

    // render.properties.get(gbuffer)

    const a = document.createElement('a')
    a.href = imageData
    a.download = 'icon'
    a.click()

    return ''
  }

  public static setEnvMap (
    scene: Scene,
    url: string,
    type: 'HDR' | 'IMG' | 'EXR' = 'IMG',
    setBackground?: boolean
  ): void {
    const apply = (texture: Texture) => {
      texture.mapping = EquirectangularRefractionMapping
      scene.environment = texture
      if (setBackground) scene.background = texture
    }

    switch (type) {
      case 'IMG': {
        new TextureLoader().load(url, apply)
        break
      }
      case 'HDR': {
        new RGBELoader().load(url, apply)
        break
      }
    }
  }

  public static getTopDownCamera (object: Group): Camera {
    const box = new Box3()
    box.setFromObject(object)
    const center = new Vector3()
    box.getCenter(center)
    const size = new Vector3()
    box.getSize(size)

    const camera = new OrthographicCamera(
      size.x / -2,
      size.x / 2,
      size.z / 2,
      size.z / -2,
      size.y * 0.09,
      size.y * 1.2
    )
    camera.position.set(center.x, center.y + size.y / 2 + size.y / 10, center.z)
    // camera.rotation.set(-90, 0, 0)
    camera.rotation.set(-Math.PI / 2, 0, 0)
    camera.updateProjectionMatrix()

    return camera
  }
}
