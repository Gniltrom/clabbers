

<template>
    <div id="app">
        <v-dropdown v-model="selectedSearchtype" :options="searchtypes" placeholder="Søgmetode" optionLabel="name"
            class="w-full md:w-14rem" />
        <InputText @update:modelValue="updateSearchInput" id="searchinput" placeholder="Søg" v-model="searchinput"
            :class="{ 'p-invalid': errorMessage }" />
        <VirtualScroller :items="searchitems" :itemSize="21" class="border-1 surface-border border-round"
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
const dict = dictionary

let errorMessage = ""

const allowedCharactersString = 'abcdefghijklmnopqrstuvxxyzæøå.[]|()*12345';
function updateSearchInput(value) {
    const allowedCharacters = allowedCharactersString.toUpperCase().split('');
    let filteredValue = value.toUpperCase().split('').filter(char => allowedCharacters.includes(char)).join('');
    searchinput.value = filteredValue;
    let group = validSearchinput(filteredValue);
    if (!group) {
        errorMessage = 1;
    }
    else {
        errorMessage = 0;
        updateSearch(group);
    }
    return filteredValue;
}

function validSearchinput(value) {
    const regexp = /([A-ZÆØÅ.][2-5]?|.[2-5]?|\[[A-ZÆØÅ]*?\][2-5]?|\*)/g
    let groups = value.match(regexp);
    let l = 0;
    if (groups) {
        groups.forEach((element) => { l += element.length })
        if (l < value.length) {
            return false;
        }
        else {
            return groups
        }
    }
    else {
        return false;
    }
}
function updateSearch(groups) {
    const permutate = (groups) => {
        const result = [];
        const backtrack = (currentPermutation, remainingElements) => {
            if (remainingElements.length === 0) {
                result.push(currentPermutation);
                return;
            }
            for (let i = 0; i < remainingElements.length; i++) {
                const newPermutation = [...currentPermutation, remainingElements[i]];
                const newRemaining = [
                    ...remainingElements.slice(0, i),
                    ...remainingElements.slice(i + 1)
                ];
                backtrack(newPermutation, newRemaining);
            }
        };
        backtrack([], groups);
        return result;
    };

    function subsets(groups) {
        let subs = [];
        function subset_helper(gr) {
            if (gr.length === 0) return [];
            if (gr.length === 1) return [gr];
            let el = gr.pop();
            const s = subset_helper(gr)
            const ss = s;
            ss.forEach((sub) => {
                sub.push(el)
            });
            subs = subs.concat(ss)
        }
        subset_helper(groups)
        return subs
    }

    let rawresultlist = [];
    let performedsearch = {}

    function searchgroup(gr) {
        let patternString = '^(' + gr.join('') + ')$'
        if (performedsearch[patternString]) return;
        performedsearch[patternString] = 1
        let re = new RegExp(patternString);
        const keylist = Object.keys(dictionary);
        for(let i = 0; i < keylist.length; i++) {
            const element = keylist[i];
            let matches = element.match(re);
            if (matches)  {
                rawresultlist.push(element);
            }
        }
    }

    if (groups) {
        rawresultlist = [];
        performedsearch = {};
        let gr = []
        groups.forEach((g) => { if (g === '*') { gr.push('.*') } else { gr.push(g) } })

        if (selectedSearchtype.value === 'A') {
            let p = permutate(gr);
            for (let i = 0; i < p.length; i++) {
                searchgroup(p[i]);
            }
        }
        else if (selectedSearchtype.value === 'M') {
            searchgroup(gr)
        }
        else if (selectedSearchtype.value === 'SA') {
            let subs = subsets(gr);
            for (let i = 0; i < subs.length; i++) {
                let p = permutate(subs[i]);
                for (let i = 0; i < p.length; i++) {
                    searchgroup(p[i]);
                }
            }
        }
        searchitems.value = [...new Set(rawresultlist)].sort()
    }
}

import { ref } from "vue";

const searchtypes = ref([
    { name: 'ANAGRAM', code: 'A' },
    { name: 'SUBANAGRAM', code: 'SA' },
    { name: 'MØNSTER', code: 'M' }
]);
const selectedSearchtype = ref('A')
const searchinput = ref()
var searchitems = ref(Object.keys(dictionary))

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

#searchinput { text-transform:uppercase; }

</style>
