import { global } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, svgIcons, svgViewBox, format_emblem, getBaseIcon, sLevel } from './../functions.js';
import { achievements, feats } from './../achieve.js';
import { races, biomes, genus_traits } from './../races.js';
import { monsters } from './../portal.js';
import { popover } from './../functions.js';

export function renderAchievePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'list':
            achievePage();
            break;
        case 'feats':
            featPage();
            break;
    }
}

const universeExclusives = {
    biome_hellscape: ['standard', 'micro', 'heavy', 'antimatter', 'magic'],
    biome_eden: ['evil'],
    cross: ['antimatter'],
    vigilante: ['evil'],
    squished: ['micro'],
    macro: ['micro'],
    marble: ['micro'],
    double_density: ['heavy'],
    heavyweight: ['heavy'],
    whitehole: ['standard'],
    heavy: ['heavy'],
    canceled: ['antimatter'],
    eviltwin: ['evil'],
    microbang: ['micro'],
    pw_apocalypse: ['magic'],
    pass: ['magic'],
    fullmetal: ['magic']
};

function achievePage(universe){
    let content = $(`#content`);
    clearElement(content);
    
    /*let filtering = `
    <div id="filtering" class="b-tabs">
        <nav class="tabs">
            <ul>
                <li><a onclick="achievePage()">${loc('universe_all')}</a></li>
                <li><a onclick="achievePage('standard')">${loc('universe_standard')}</a></li>
                <li><a onclick="achievePage('evil')">${loc('universe_evil')}</a></li>
                <li><a onclick="achievePage('antimatter')">${loc('universe_antimatter')}</a></li>
                <li><a onclick="achievePage('micro')">${loc('universe_micro')}</a></li>
                <li><a onclick="achievePage('heavy')">${loc('universe_heavy')}</a></li>
                <li><a onclick="achievePage('magic')">${loc('universe_magic')}</a></li>
            </ul>
        </nav>
    </div>
    `;
    content.append(filtering);*/
    
    let universeLevel = 'l';
    switch (universe){
        case 'evil':
            universeLevel = 'e';
            break;
        case 'antimatter':
            universeLevel = 'a';
            break;
        case 'micro':
            universeLevel = 'm';
            break;
        case 'heavy':
            universeLevel = 'h';
            break;
        case 'magic':
            universeLevel = 'mg';
            break;
    }

    let types = {};
    Object.keys(achievements).forEach(function (achievement){
        if (!universe || !universeExclusives[achievement] || universeExclusives[achievement].indexOf(universe) > -1){
            if (types.hasOwnProperty(achievements[achievement].type)){
                types[achievements[achievement].type].push(achievement);
            }
            else {
                types[achievements[achievement].type] = [achievement];
            }
        }
    });
    
    Object.keys(types).forEach(function (type){
        content.append($(`<h2 class="header achievements has-text-caution">${loc(`wiki_achieve_${type}`)}</h2>`));
        let list = $(`<div class="achieveList"></div>`);
        content.append(list);

        types[type].forEach(function(achievement){
            let achieve = $(`<div class="achievement"></div>`);
            list.append(achieve);

            let color = global.stats.achieve[achievement] && global.stats.achieve[achievement][universeLevel] && global.stats.achieve[achievement][universeLevel] > 0 ? 'warning' : 'fade';
            achieve.append(`<span id="a-${achievement}" class="achieve has-text-${color}">${achievements[achievement].name}</span>`);

            let emblems = format_emblem(achievement,16,false,false,universe);
            achieve.append(`<span class="icons">${emblems}</span>`);
            
            achieveDesc(achievement, color === 'warning' ? true : false);
        });
    });
}

function featPage(){
    let content = $(`#content`);
    clearElement(content);

    let list = $(`<div class="achieveList"></div>`);
    content.append(list);

    Object.keys(feats).forEach(function (feat){
        let achieve = $(`<div class="achievement"></div>`);
        list.append(achieve);

        let color = global.stats.feat[feat] && global.stats.feat[feat] > 0 ? 'warning' : 'fade';
        let baseIcon = getBaseIcon(feat,'feat');
        let star = global.stats.feat[feat] > 1 ? `<p class="flair" title="${sLevel(global.stats.feat[feat])} ${loc(baseIcon)}"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
        achieve.append(`<span id="f-${feat}" class="achieve has-text-${color}">${feats[feat].name}</span>${star}`);
        
        popover(`f-${feat}`,featDesc(feat));
    });
}

function achieveDesc(achievement,showFlair){
    let flair = showFlair ? `<div class="has-text-flair">${achievements[achievement].flair}</div>` : ``;
    if (achievement === 'mass_extinction' || achievement === 'vigilante'){
        let killed = `<div class="flexed">`;
        Object.keys(races).sort(function(a,b){
            if (races[a].hasOwnProperty('name') && races[b].hasOwnProperty('name')){
                return races[a].name.localeCompare(races[b].name);
            }
            else {
                return 0;
            }            
        }).forEach(function (key){
            if (key !== 'protoplasm' && (key !== 'custom' || (key === 'custom' && global.stats.achieve['ascended']))){
                if ((achievement === 'vigilante' && races[key].type !== 'demonic') || achievement === 'mass_extinction'){
                    if (global.stats.achieve[`extinct_${key}`] 
                        && (
                            achievement === 'mass_extinction'
                            ? global.stats.achieve[`extinct_${key}`].l >= 0
                            : global.stats.achieve[`extinct_${key}`].hasOwnProperty('e') && global.stats.achieve[`extinct_${key}`].e >= 0
                            )
                        ){
                        killed = killed + `<span class="iclr${global.stats.achieve[`extinct_${key}`][achievement === 'mass_extinction' ? 'l' : 'e']}">${races[key].name}</span>`;
                    }
                    else {
                        killed = killed + `<span class="has-text-danger">${races[key].name}</span>`;
                    }
                }
            }
        });
        killed = killed + `</div>`;
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div>${killed}${flair}`));
    }
    else if (achievement === 'explorer'){
        let biome_list = `<div class="flexed">`;
        Object.keys(biomes).sort((a,b) => biomes[a].label.localeCompare(biomes[b].label)).forEach(function (key){
            if (global.stats.achieve[`biome_${key}`] && global.stats.achieve[`biome_${key}`].l >= 0){
                biome_list = biome_list + `<span class="iclr${global.stats.achieve[`biome_${key}`].l}">${biomes[key].label}</span>`;
            }
            else {
                biome_list = biome_list + `<span class="has-text-danger">${biomes[key].label}</span>`;
            }
        });
        biome_list = biome_list + `</div>`;
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div>${biome_list}${flair}`));
    }
    else if (achievement === 'creator' || achievement === 'heavyweight'){
        let genus = `<div class="flexed">`;
        Object.keys(genus_traits).sort().forEach(function (key){
            if (achievement === 'creator' ? global.stats.achieve[`genus_${key}`] && global.stats.achieve[`genus_${key}`].l >= 0 : global.stats.achieve[`genus_${key}`] && global.stats.achieve[`genus_${key}`].h >= 0){
                genus = genus + `<span class="wide iclr${achievement === 'creator' ? global.stats.achieve[`genus_${key}`].l : global.stats.achieve[`genus_${key}`].h}">${loc(`genelab_genus_${key}`)}</span>`;
            }
            else {
                    genus = genus + `<span class="wide has-text-danger">${loc(`genelab_genus_${key}`)}</span>`;
            }
        });
        genus = genus + `</div>`;
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div>${genus}${flair}`));
    }
    else if (achievement === 'enlightenment'){
        let genus = {};
        Object.keys(global.pillars).forEach(function(race){
            if (races[race]){
                if (!genus[races[race].type] || global.pillars[race] > genus[races[race].type]){
                    genus[races[race].type] = global.pillars[race];
                }
            }
        });
        let checked = `<div class="flexed">`;    
        Object.keys(genus_traits).sort().forEach(function (key){
            if (genus[key] && genus[key] >= 1){
                checked = checked + `<span class="wide iclr${genus[key]}">${loc(`genelab_genus_${key}`)}</span>`;
            }
            else {
                checked = checked + `<span class="wide has-text-danger">${loc(`genelab_genus_${key}`)}</span>`;
            }
        });
        checked = checked + `</div>`;
        popover(`a-${achievement}`,$(`<div class="wide has-text-label">${achievements[achievement].desc}</div><div>${loc(`wiki_achieve_${achievement}`)}</div>${checked}${flair}`));
    }
    else if (achievement === 'gladiator'){
        let defeated = `<div class="flexed wide">`;
        let list = {};
        Object.keys(global.stats.spire).forEach(function(universe){
            Object.keys(global.stats.spire[universe]).forEach(function(boss){
                if (monsters[boss]){
                    if (!list.hasOwnProperty(boss) || list[boss] < global.stats.spire[universe][boss]){
                        list[boss] = global.stats.spire[universe][boss];
                    }
                }
            });
        });
        Object.keys(monsters).forEach(function (boss){
            if (list[boss] && list[boss] > 0){
                defeated = defeated + `<span class="swide iclr${list[boss]}">${loc(`portal_mech_boss_${boss}`)}</span>`;
            }
            else {
                defeated = defeated + `<span class="swide has-text-danger">${loc(`portal_mech_boss_${boss}`)}</span>`;
            }
        });
        defeated = defeated + `</div>`;
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div><div>${loc(`wiki_achieve_${achievement}`)}</div>${defeated}${flair}`),{
            wide: true
        });
    }
    else if (achievement.includes('extinct_') && achievement.substring(8) !== 'custom'){
        let race = achievement.substring(8);
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div><div>${loc('wiki_achieve_extinct_race',[loc(`race_${race}`)])}</div>${flair}`));
    }
    else if (achievement.includes('genus_')){
        let genus = achievement.substring(6);
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div><div>${loc('wiki_achieve_genus_type',[loc(`genelab_genus_${genus}`)])}</div>${flair}`));
    }
    else if (achievement.includes('biome_') || achievement.includes('atmo_')){
        let planet = achievement.substring(achievement.indexOf('_') + 1);
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div><div>${loc('wiki_achieve_planet_type',[achievement.substring(0,1) === 'b' ? loc(`biome_${planet}_name`) : loc(`planet_${planet}`)])}</div>${flair}`));
    }
    else {
        popover(`a-${achievement}`,$(`<div class="has-text-label">${achievements[achievement].desc}</div><div>${loc(`wiki_achieve_${achievement}`)}</div>${flair}`));
    }
}

function featDesc(feat){
    if (feat === 'egghunt'){
        let eggs = `<div class="has-text-warning">${loc('wiki_feat_egghunt')}</div><div class="flexed">`;
        for (let i=1; i<13; i++){
            let egg = global.special.egg[`egg${i}`] ? 'has-text-success' : 'has-text-danger';
            eggs = eggs + `<span class="${egg}">${loc('wiki_feat_egghunt_num',[i])}</span>`
        }
        eggs = eggs + `<div>`;
        return $(`<div>${feats[feat].desc}</div>${eggs}`);
    }
    else if (feat === 'trickortreat'){
        let tricks = `<div class="has-text-warning">${loc('wiki_feat_trickortreat')}</div><div class="flexed wide">`;
        for (let i=1; i<13; i++){
            let trick = global.special.trick[`trick${i}`] ? 'has-text-success' : 'has-text-danger';
            
            tricks = tricks + `<span class="wide ${trick}">${loc(i > 6 ? 'wiki_feat_trick_num' : 'wiki_feat_treat_num',[i > 6 ? i - 6 : i])}</span>`
        }
        tricks = tricks + `<div>`;
        return $(`<div>${feats[feat].desc}</div>${tricks}`);
    }
    else {
        return $(`<div>${feats[feat].desc}</div>`);
    }
}