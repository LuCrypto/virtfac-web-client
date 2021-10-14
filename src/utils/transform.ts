import V from '@/utils/vector'

/**
* Transform T is class of object with position and size
*/
export default class T {
   position: V
   size: V

   constructor (position: V | null, size: V | null) {
     this.position = position || new V(null, null)
     this.size = size || new V(42, 42)
   }

   // Flip transform to keep positive size
   makeAbsoluteSize (): void {
     if (this.size.x < 0) {
       this.position.x += this.size.x
     }
     if (this.size.y < 0) {
       this.position.y += this.size.y
     }
     this.size = this.size.absV()
   }

   // Checks if a transform contains a vector
   contains (v: V): boolean {
     this.makeAbsoluteSize()
     return (
       v.x >= this.position.x &&
         v.y >= this.position.y &&
         v.x <= this.position.x + this.size.x &&
         v.y <= this.position.y + this.size.y
     )
   }

   // Check if transform is in an other transform
   isIn (t: T): boolean {
     this.makeAbsoluteSize()
     t.makeAbsoluteSize()
     return (
       this.position.x >= t.position.x &&
         this.position.y >= t.position.y &&
         this.position.x + this.size.x <= t.position.x + t.size.x &&
         this.position.y + this.size.y <= t.position.y + t.size.y
     )
   }
}
