<template>
  <div  @dragover="dragOver" class="container">
    <div @dragstart="dragStart" @dragend="dragEnd($event,item)" draggable="true" class="nested-container" v-for="item in items" :key="item.id" :id='item.id'>
      <div  class="nested-item">
        <div  class="title" @click="handleItemClick(item)">
          <p>{{ item.title }}</p>
        </div>
        
          <div  class="" 
          :class="{open:item.open , closed:!item.open}" 
          >
            <transition
            name="expand"
            @enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
            >
              <NestedItem 
                class="" 
                :items="item.children"
                v-show="item.open && item.children.length"
              />
            </transition>
            
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useCategoryStore} from '../stores/todo'
const categoryStore = useCategoryStore()

const props = defineProps({
  items:Array,
  toggle:Boolean,
  editinput:Object
});
function handleItemClick(item){
    item.open = !item.open
}
// 

function enter(el) {
  el.style.height = 'auto';
  const height = getComputedStyle(el).height;
  el.style.height = 0;
  setTimeout(()=>{
    el.style.height = height;
  })
};
function afterEnter(el) {
  el.style.height = 'auto';
};
function leave(el) {
  el.style.height = getComputedStyle(el).height;
  setTimeout(() => {
    el.style.height = 0;
  });
};


function dragStart(e){
  // if (props.toggle) {
    e.target.classList.add('dragging')
    e.target.parentNode.classList.add('dragelementsContainer')
    return
  // }
  // e.preventDefault()
}

function dragOver(e){
  if (props.toggle) {
    e.preventDefault();
    const dragged = document.querySelector('.dragging')
    dragged.classList.remove("preventswapping")
    const dragelementsContainer = dragged &&  document.querySelector('.dragging')?.parentElement
    const afterElement = getAfterElement(dragelementsContainer,e.clientY);
    if (afterElement.element && afterElement.element.parentElement==dragelementsContainer) {
      if (afterElement.element) {
        dragelementsContainer.insertBefore(dragged,afterElement.element)
      }
    }else{
      dragelementsContainer.appendChild(dragged)
    }
  }
  
}

async function dragEnd(e,item){
  
  const dragged = document.querySelector('.dragging')
  const dragelementsContainer = dragged &&  document.querySelector('.dragging')?.parentElement
  const afterElement = getAfterElement(dragelementsContainer,e.clientY);
  const deleteContainer = document.querySelector('.delete-container')
  const preventSwappedDraggedEl = document.querySelector('.preventswapping')
  const editContaienr = document.querySelector('.edit-container')

  try {
      // dragged.classList.remove('preventeditswapping');
      if (props.toggle) {
        if (afterElement.element && afterElement.element.parentElement==dragelementsContainer) {
          if (afterElement.element) {
            // dragelementsContainer.insertBefore(dragged,afterElement.element)
          }
        }else{
          // dragelementsContainer.appendChild(dragged)
        }
        if (dragelementsContainer && dragelementsContainer instanceof HTMLElement) {
        const childNodes =dragelementsContainer && Array.from(dragelementsContainer.childNodes).filter(node => node.nodeType === 1);
        const childProps =dragelementsContainer && childNodes.filter(f=>f!==undefined).map((m,i)=>{
          return {
            id:m.id,
            idx:i+1
          }
        })
        
        async function performApiRequest(id,payload) {
          try {
            const response = await fetch(`http://localhost:3002/categories/${id}`,{
              method:"PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body:JSON.stringify({sortorder:payload})
            });
            if (!response.ok) {
                throw new Error(`Fetch error for ID ${id}: ${response.statusText}`);
            }
              const data = await response.json();
              console.log(`Data for ID ${id}:`, data);
          } catch (error) {
            console.error(`Error for ID ${id}:`, error);
          }
          };
        
          for (const item of childProps) {
              await new Promise(resolve => setTimeout(resolve, 500)); // 1-second interval
                performApiRequest(item.id,item.idx).then(()=>{
                  dragged.classList.remove('dragging');
                  // dragged.classList.remove('draggingOver');
                  dragelementsContainer.classList.remove('dragelementsContainer')
                  document.querySelectorAll('.draggingover').forEach(el=>{
                    el.classList.remove('draggingover')
                  })
                }
              );
          }
          
        }      
      }
      if (preventSwappedDraggedEl) {
        
        deleteContainer.appendChild(dragged);
        preventSwappedDraggedEl.classList.remove('preventswapping');
        categoryStore.deleteCategory(preventSwappedDraggedEl.id,item)
      }
      
      if (editContaienr && dragged.classList.contains('preventeditswapping')) {
        const item = categoryStore.categories.find(c=>c.id==dragged.id)
        props.editinput.value=item.title;
        props.editinput.id=item.id;
        dragged.classList.remove('dragging');
        dragged.classList.remove('draggingover');
        // dragged.classList.remove('preventeditswapping');
      }
    }catch (error) {
      console.log(error);
    }
}

function getAfterElement(container,y){
      const draggedElements = [...container.querySelectorAll('.nested-container:not(.dragging)')];
      return draggedElements.reduce((props,child)=>{
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height/2
        
        if (offset<0 && offset>props.offset) {
          return {offset:offset,element:child}
        }else{
          return props
        }
      },{offset:Number.NEGATIVE_INFINITY})
}


</script>



<style scoped>
  
/* dropdown */

  .expand-enter-active, .expand-leave-active {
      transition: height .2s ease-in-out;
      overflow: hidden;
  }

  .title p{
    padding: 10px;
  }

  .nested-container{
    cursor: pointer;
    /* margin-top: 10px; */
  }

  .nested-item{
    border: 1px solid;
    margin: 10px;
  }

  .container{
    /* margin-top: 100px; */
    /* margin: 15px; */
  }

  .dragging{
    background: black;
    color: white;
    /* height: 60px; */
    overflow: hidden;
  }

  .draggingover{
    background: black !important;
    color: white;
    height: 60px;
    overflow: hidden;
  }
</style>
