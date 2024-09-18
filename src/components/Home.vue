<template>
  <div class="crud-container"> 
      <div class="create-container">
        <h1>Create an item Here</h1>

        <div v-if="categoryStore.categories.length">
          <select  v-model="selectedCategory">
            <option :value="category.id" v-for="category in categoryStore.categories" :key="category.id">{{category.title}}</option>
          </select>
        </div>
        <input v-model="input"/>
        <button @click="addCategory">submit</button>
        
      </div>
      <div class="edit-container" @dragover="onEditDragend" @dragleave="onEditDragLeave">
        <h1>Drop an item Here to Edit</h1>
        <input v-model="editinput.value"/>
        <h1 v-if="editinput.value">{{editinput.value}}</h1>
        <button @click="editCategory(editinput)">submit edit</button>
      </div>
      <div class="list-container">
        <div class="heading">
          <h1>Nested Item List</h1>
          <span class="toggle" @click="handleToggle(toggle)" :class="{toggleTrue:toggle}">⇌</span>
        </div>
        <NestedItem :items="categoryStore.nestedCategoryList" :toggle="toggle" :editinput="editinput"/>
      </div>
      <div @dragover="ondeleteontainerDragover" class="delete-container" @dragleave="onDeleteDragLeave">
          <h1>Drop an item Here to Delete</h1>
      </div>
  </div>
</template>

<script setup>
  import { computed, onMounted , onUpdated, ref, watchEffect } from 'vue';
  import {useCategoryStore} from '@/stores/todo';
  
  //components
  import NestedItem from './NestedItem.vue';
  //components

  const categoryStore = useCategoryStore();

  const input = ref('')
  const selectedCategory = ref(null)
  const editinput = ref({value:"",id:null})
  const nestedLists = ref([])
  const loading = ref(false)

  function addCategory(){
    const payload={
      title:input.value,
      parentid:selectedCategory.value,
      sortorder: categoryStore.categories.length+1
    }
    if (payload.title) {
      categoryStore.createCategory(payload)
    }
    selectedCategory.value = ''
    input.value = ''
  }
  
  async function onEditDragend(e) {
    e.preventDefault();
    const dragged = document.querySelector('.dragging')
    dragged.classList.add('preventeditswapping');
    dragged.classList.remove('preventswapping');
  }

  function onEditDragLeave(){
    const dragged = document.querySelector('.dragging')
    dragged.classList.remove('preventeditswapping');
    editinput.value.value='';
    editinput.value.id=''; 
  }
  

  async function editCategory(payload){
    const data={
      id:payload.id,
      title:payload.value,
    }
    categoryStore.editCategory(data)
    await fetch(`http://localhost:3002/categories/${data.id}`,{
        method:"PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({title:data.title}) 
    });
    editinput.value.value = ''
  }

  function ondeleteontainerDragover(e) {
    const dragelement = document.querySelector('.dragging');
    e.preventDefault()
    dragelement.classList.add('preventswapping');
  }
  function onDeleteDragLeave(){
    const dragged = document.querySelector('.dragging')
    dragged.classList.remove('preventswapping'); 
  }
  // const nestedCat = ref([])
  onMounted(()=>{
    categoryStore.getCategories();
  });

  const toggle = ref(false)
  function handleToggle(){
    toggle.value = !toggle.value
  }
</script>

<style>
  
  .loading{
    background: #333;
  }
  .nonloading{
    background: #FFFFFF;
  }

  .crud-container{
    height: 100vh;
    display: grid;
    grid-template-columns: .5fr 2fr;
    grid-template-rows: 1fr 1fr 1fr;
  }

  
  
  .list-container{
    grid-area: 1/1/4/2;
    background: #FFFFFF;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .create-container{
    grid-area: 1/2/2/3;
    background-color: #eee;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .edit-container{
    grid-area: 2/2/3/3;
    background: #b7b6b6;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  
  .delete-container{
    grid-area: 3/2/4/3;
    background-color: #eee;
    height: 100%;
    display: flex;
    /* justify-content: center; */
    align-items: center;
    flex-direction: column;
  }

  input{
    padding: 10px;
    display: block;
    margin: 10px;
  }
  button{
    padding: 10px;
    display: block;
    margin: 10px;
  }
  select{
    padding: 10px;
    display: block;
    margin: 10px;
  }

  h1{
    text-align: center;
    margin:10px
  }

  .heading{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .toggle{
    cursor: pointer;
    margin:10px;
    font-size: 2rem;
    transform: rotate(-90deg);
    transition: .5s all;
  }
  .toggleTrue{
    font-weight: 900;
    transform: rotate(90deg);
    transition: .5s all;
  }

</style>