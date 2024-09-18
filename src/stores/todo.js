import { defineStore } from 'pinia'

export const useCategoryStore = defineStore("Category",{
  // id:,
  
  state:()=>({
    categories:[],
    nestedCategories:[]
  }),
  
  actions:{

    async deleteCategory(id,payload) {
      const deletedCategory = this.categories.find(f=>f.id==id)
      const obj = {
        id:deletedCategory.id,
        title:deletedCategory.title,
        parentid:deletedCategory.parentid,
        sortorder:deletedCategory.sortorder,
        children:[]
      }
      // loading = true
      try {
        await updateDb(deletedCategory.id,payload).then(async()=>{
          this.categories = this.categories.filter(f=>f.id != id);
          this.categories = this.categories.filter(f=>f.parentid != id);
          await deleteNestedCategory(this.nestedCategories,obj)
        })
      } catch (error) {
        console.log(error);
      }
       
       
      
    },
    
    async createCategory(payload) {
      const response = await fetch('http://localhost:3002/categories',
      {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body:JSON.stringify(payload)
      });
      const json_res = await response.json();
      if (json_res) {
        this.categories = [...this.categories,json_res]
        const newCategory = {
          ...json_res,
          children:[]        
        }
        
        this.nestedCategories = addNestedCategory(this.nestedCategories,newCategory)
      }
    },
    
    async getCategories() {
      const response = await fetch('http://localhost:3002/categories',{
        method:"GET",
        headers: {
          "Content-Type": "application/json",
        }, 
      }).catch(e=>console.log(e))
      
      if (response.ok) {
        const json_res = await response.json();
        if (json_res) {
          this.categories=json_res
          this.nestedCategories= arrangeArr(json_res)
        }
      }
    },

    editCategory(payload){
      console.log(payload);
      editNestedCategory(this.nestedCategories,payload)
      console.log(this.nestedCategories);
    },

    async updateDraggedItems(id,payload){
      
    }
  },

  getters:{
    nestedCategoryList: (state) => {
      const arrangeUpdatedarray = (list) => {
        function applyupdateList (item){
        if (item.children) {
          if (item.children.length) {
            item.open = false
          }else{
            item.open = false
          }
          return true
        }
        for (const item of item.children){
          if (applyupdateList) {
            return true
          }
        }
        //item.open= true
          // return false
        }

        let arr = []
        for (const item of list) {
          if (applyupdateList(item)) {
            arr.push(item)
          }
        }
        return arr
      }
      return arrangeUpdatedarray(state.nestedCategories)
    }
  }
})




const addNestedCategory = (arr,cat) => {
  if (!cat.parentid) {
        const addLinearCategory= [
            ...arr,
            cat
        ]
        return addLinearCategory
  }

  const adddedCategories = arr.map(m=>{
    if (m.id==cat.parentid) {
      return {
        ...m,
        children : addNestedCategory([...m.children,cat],cat)
      }
    }else{
      return {
        ...m,
        children:addNestedCategory(m.children,cat)
      }
    }
  })
  return adddedCategories
}

function arrangeArr(arr,parentid=null)  {
  let cat;
  if (!parentid ) {
    cat = arr.filter(f=>!f.parentid).sort((a, b) => a.sortorder - b.sortorder)
  }else{
    cat = arr.filter(f=>f.parentid==parentid).sort((a, b) => a.sortorder - b.sortorder)
  }
  const result = cat.map(m=>{
    return {
      id:m.id,
      title:m.title,
      parentid:m.parentid,
      sortorder:m.sortorder,
      children:arrangeArr(arr,m.id)
    }
  })
  return result
  
}

async function deleteNestedCategory  (arr,cat)  {
  async function popoutByPayload(items,payload){
    // console.log("items=====",items);
    for (let i = 0; i < items.length; i++) {
      if (items[i].id==payload.id) {
        items.splice(i,1)
        return;
      }
      if (items[i].children && items[i].children.length>0) {
        popoutByPayload(items[i].children,payload)
      }
    }
    
  }
  if (cat.id) {
    await popoutByPayload(arr,cat)
  }
  // console.log(arr);
}

const editNestedCategory = (arr,cat) => {
  function addpayloadtoItem(item,id,payload){
    if (item.id==id) {
      item.title = payload.title;
      return true
    }
    for(const child of item.children){
      if (addpayloadtoItem(child,id,payload)) {
        return true
      }
    }
  }

  function addPayloadAndReorderHierarchy (items,id,payload) {
    for(const item of items){
      if (addpayloadtoItem(item,id,payload)) {
        return 
      }
    }
  }

  addPayloadAndReorderHierarchy(arr,cat.id,cat)
}


const updateDb = async function(id,payload){
  const updateData = updateDataUtil([payload])  
  // console.log(updateData);
  
  async function deleteItems (id){
    try {
      if (id) {
        await fetch(`http://localhost:3002/categories/${id}`,
        {
          method:"DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.log(error);
    }
  }
  for (const item of updateData){
    try {
       await new Promise (resolve=>{
        setTimeout(resolve,500)
        if (item) {
          deleteItems(item)
        }
      }).then(()=>{
        console.log('all data deleted');
      }).catch((error)=>{
        console.log(error);
      })
    } catch (error) {
      console.log(error);
    }
  }
}


function updateDataUtil(categories){
  function abc(category,array=[]){
    if (category.id) {
      array.push(category.id)
    }
    for(const item of category.children){
      abc(item,array)
    }
  }

  let arr = []
  for (const item of categories) {
    abc(item,arr)
    return arr
  }
  
}



