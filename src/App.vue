

<template>
    <div id="app">
          <InputText @update:modelValue="updateSearchInput" id="searchinput" placeholder="Søg" />
        <VirtualScroller :items="items" :itemSize="21" class="border-1 surface-border border-round"
            style="width: 500px; height: 600px">
            <template v-slot:item="{ item, options }">
                <table :class="['flex align-items-center p-2', { 'surface-hover': options.odd }]" style="height: 30px">
                    <tr>
                        <td style="text-align:right; width: 190px;">{{ dict[item].prehooks }}</td>
                        <td style="text-align: left; width: 100px;"><strong>{{ item }}</strong></td>
                        <td style="text-align: left;">{{ dict[item].sufhooks }}</td>
                    </tr>
                </table>
            </template>
        </VirtualScroller>

    </div>
</template>

<script setup>
    import { dictionary } from "./assets/all.js"
    import 'primevue/virtualscroller'
    var items = Object.keys(dictionary)
    const dict = dictionary
    console.log("Setup");

    const allowedCharactersString = 'abcdefghijklmnopqrstuvxxyzæøå.[]|()*12345';
    function updateSearchInput (value) {
        const allowedCharacters = allowedCharactersString.toUpperCase().split('');
        let filteredValue = value.toUpperCase().split('').filter(char => allowedCharacters.includes(char)).join('');
        document.getElementById("searchinput").value=filteredValue;
    }



</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
