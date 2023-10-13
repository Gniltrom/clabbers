

<template>
        <v-dropdown v-model="selectedSearchtype" @change="updateSearchInput(searchinput)" :options="searchtypes" placeholder="Søgmetode" optionLabel="name"
            class="w-full md:w-14rem" />
        <InputText @update:modelValue="updateSearchInput" id="searchinput" placeholder="Søg" v-model="searchinput"
            :class="{ 'p-invalid': errorMessage }" />
        <div>
            <h2 :hidden="!hitcount" id="hitcount">Søgning matcher {{ hitcount }} opslag</h2>
            <VirtualScroller :items="searchitems" :itemSize="21" class="border-1 surface-border border-round"
                style="width: 500px; height: 600px">
                <template v-slot:item="{ item, options }">
                    <table :title="getDictline(item)" :class="['flex align-items-center p-2', { 'surface-hover': options.odd }]" style="height: 30px">
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


<script>
export default {
    name: 'SearchTab'
}
</script>

<script setup>
import { dictionary } from "./dictionary.js"
import VirtualScroller  from "primevue/virtualscroller"
const dict = dictionary
const sorteddict = {};
for (const key in dictionary) {
    const sortkey = key.split("").sort((a, b) => a.localeCompare(b, 'da')).join("");
    let slot = sorteddict[sortkey];
    if (!slot) {
        slot = sorteddict[sortkey] = []
    }
    slot.push(key);
    if (sorteddict[sortkey].length > 11) console.log(sortkey + ' ' + sorteddict[sortkey].join(", "));
}

let errorMessage = ""

const allowedCharactersString = 'abcdefghijklmnopqrstuvxxyzæøå.[]|()*12345';
function updateSearchInput(value) {
    const allowedCharacters = allowedCharactersString.toUpperCase().split('');
    let filteredValue = value.toUpperCase().split('').filter(char => allowedCharacters.includes(char)).join('');
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
    const regexp = /([A-ZÆØÅ.][2-5]?|\[[A-ZÆØÅ]+?\][2-5]?|\*)/g
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

function getDictline( item ) {
    return dictionary[item].dictline.replace(/\b([2-9]\.)/g,"\n$1");
}

function updateSearch(groups) {
    console.log(selectedSearchtype.value)
    function subsets(arr) {
        const result = [];

        function generateSubsets(index, currentSubset) {
            if (index === arr.length) {
                if (currentSubset.length > 0) {
                    result.push(currentSubset.slice());  // Add a copy of the subset
                }
                return;
            }

            currentSubset.push(arr[index]);
            generateSubsets(index + 1, currentSubset);
            currentSubset.pop();
            generateSubsets(index + 1, currentSubset);
        }

        generateSubsets(0, []);
        return result.filter((ss) => ss.length > 1);
    }

    let rawresultlist = [];
    let performedsearch = {};

    function expandGroup(gr) {
        let gr2 = gr.map((g) => g === '.' ? '[ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ]' : g)
        let pres = [[]];
        for (let i = 0; i < gr2.length; i++) {
            if (gr[i].substring(0, 1) === '[') {
                let s = gr2[i].replace(/[^A-ZÆØÅ]/g, '')
                for (let j = pres.length -1; j >=0; j--) {
                    let p = pres[j];
                    let newp = s.split("").map( (letter) => [...p,letter])
                    pres.splice(j,1,...newp)
                }
            }
            else {
                pres.forEach((pre) => { pre.push(gr2[i]) });
            }
        }
        console.log("pre.length="+pres.length)
        return pres;
    }
    
    function searchgroup(gr,expand) {
        let grSort = gr;
        grSort.sort((a, b) => a.localeCompare(b, 'da'));
        const grStr = grSort.join("");

        if (gr.filter((g) => g.match(/^(\*|\.)/)).length > 3 ||
            gr.filter((g) => g.match(/^(\*|\.)/)).length > 0 )
        {
            if ( performedsearch[grStr]) return;
            searchRegexp(gr);
            performedsearch[grStr] = 1;
            return;
        }

        if (expand) { 
            expandGroup(grSort).forEach(searchgroup,0)
            return;
        }
        else {
            if (sorteddict[grStr]) {
                if ( performedsearch[grStr]) return
                performedsearch[grStr] = 1;
                rawresultlist.push(...sorteddict[grStr]);
                return;
            }
        }
    }

    function searchRegexp (gr) {
        let reStr = '^('+gr.map((g) => (g === '*' ? '.*' : g)).join("")+')$'
        let re = new RegExp(reStr)
        const wl = Object.keys(dictionary);
        wl.forEach((w) => { if (w.match(re)) rawresultlist.push(w) })
    }

    if (groups && groups.length > 1) {
        rawresultlist = [];
        performedsearch = {};
        //        let gr = []
        //        groups.forEach((g) => { if (g === '*') { gr.push('.*') } else { gr.push(g) } })

        if (selectedSearchtype.value.code === 'A') {
            searchgroup(groups,1);
        }
        else if (selectedSearchtype.value.code === 'M') {
            searchRegexp(groups)
        }
        else if (selectedSearchtype.value.code === 'SA') {
            let subs = subsets(groups);
            for (let i = 0; i < subs.length; i++) {
                searchgroup(subs[i],1);
            }
        }
        searchitems.value = [...new Set(rawresultlist)].sort((a, b) => a.localeCompare(b, 'da'))
        hitcount.value = searchitems.value.length
    }
    else {
        searchitems.value = Object.keys(dictionary);
    }

}

import { ref } from "vue";

const searchtypes = ref([
    { name: 'ANAGRAM', code: 'A' },
    { name: 'SUBANAGRAM', code: 'SA' },
    { name: 'MØNSTER', code: 'M' }
]);
const hitcount = ref();
const selectedSearchtype = ref(searchtypes.value[0])
const searchinput = ref()
var searchitems = ref(Object.keys(dictionary))
hitcount.value = searchitems.value.length

</script>

<style>

#hitcount {
    text-align: left;
}

#searchinput {
    text-transform: uppercase;
}
</style>
