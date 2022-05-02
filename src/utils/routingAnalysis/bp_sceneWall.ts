import { V } from '@/utils/nodeViewer/v'
import { Blueprint } from './blueprint'
import { Node } from '@/utils/graph/node'
import { Link } from '@/utils/graph/link'
import { Vec2, Vector2 } from '../graph/Vec'

export class BlueprintScene {
    private scene : BlueprintScene

    public constructor(scene: BlueprintScene){
        this.scene = scene
        
    }
}