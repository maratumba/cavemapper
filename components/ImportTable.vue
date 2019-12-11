<template>
  <div id="container">
    <textarea id="paste-area" :v-model="text"></textarea>
    <table id="parsed-table">
      <thead>
        <tr>
          <th>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped lang="scss">
#container{
  width: 100%;
  position: relative;
}
#paste-area{
  width: 100%;
}
</style>