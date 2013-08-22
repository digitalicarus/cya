define([
        'jquery', 
        'dot',
        'text!../data/adjectives.json', 
        'text!../data/phrases.json'', 
        'text!../tmpl/letter.dot'
], function ($, dot, adj, phrase, letter) {
    try {
        adj    = JSON.parse(adj);
        phrase = JSON.parse(phrase);
        letter = dot.compile(letter);
    } catch (e) {
        console.log(e);
    }

    var data               = {}
    ,   members            = ['greeting', 'subject', 'thesis', 'closing', 'general']
    ,   i                  = 0
    ,   tmp                = null // general purpose
    ,   curr               = null
    ,   adjRegex           = /{{=adj\.([^}]*)}}/gi
    ,   minPhrases         = 2
    ,   morePhrases        = 3
    ,   allPurposeAdj      = null
    ,   tmpl               = { greeting: null, subject: null, thesis: null, closing: null, phrases: [] }
    ;

    data.input = {};

    // fold the 'all' category of adjectives into the other members and retain 'all' as separate data
    allPurposeAdj = adj.filter(function (item) { if (item.type === 'all') return true; else return false; })[0];
    for (i in adj) {
        if (adj.hasOwnProperty(i) && adj[i].type !== 'all') {
            adj[i].list = adj[i].list.concat(allPurposeAdj.list);
        }
    }
    adj = adj.filter(function (item) { if (item.type === 'all') return false; else return true; });
    console.log(adj);
    
 
    function rankSort (a, b) {
        return a.rank > b.rank;
    }

    function randSort () { 
        return Math.round(Math.random()) - 0.5; 
    }

    function checkValidity (ele) {
        var valid = false;
        try {
            valid = ele.checkValidity();
            if (!valid) {
                $(ele).addClass('error');
            } else {
                $(ele).removeClass('error');
            }
        } catch (e) {}

        return valid;
    }

    function checkAllValidity () {
        $('input').each(function (i, v) {
            checkValidity(v);
        });
    }

    function getValue (selector) {
        var $item = null
        ,   val   = null
        ;

        $item = $(selector);
        val = $item.val();

        if (val.match(/^\s*$/) || !checkValidity($item[0])) {
            return null;
        } else {
            return val;
        }
    }

    function adjReplace (match, type) {
        var adjCat = null;
        type = type || 'all';

        console.log("replacing adj of type '" + type + "'"); 
        if (type) {
            adjCat = adj.filter(function (item) { return item.type === type; });
            console.log("Found", adjCat);
            if (adjCat.length > 0) { adjCat = adjCat[0]; }
        }
        if (!adjCat || adjCat.length < 1) { 
            adjCat = allPurposeAdj;
        }
        console.log("using ", adjCat);
        adjCat.list.sort(randSort);
        return adjCat.list[0];
    }

    // generate new random components
    function randomizeLetter () {

        // random all letter components
        for (i = 0; i < members.length; i++ ) {
            curr = members[i];

            if (phrase.hasOwnProperty(curr) && phrase[curr] instanceof Array) {
                console.log("randomizing " + curr);
                phrase[curr].sort(randSort);
            }

            // compile templates
            try {
                console.log("compiling -- " + phrase[curr][0]);
                tmpl[curr] = dot.compile(phrase[curr][0]);
            } catch (e) {
                console.log("problem compiling template", phrase[curr][0]);
            }
        }
 
        // get random phrases and rank sort them
        tmpl.phrases = phrase.general
            .slice(0) // copy original array
            .splice(0, Math.round(minPhrases + Math.random() * 3))
            .sort(rankSort)
            .map(function (item) { 
                    // plug in some adjectives
                    console.log("Working on phrase " + item.phrase);
                    tmp = item.phrase.replace(adjRegex, adjReplace);
                    console.log("Phrase with ADJ " + tmp);
                try {
                    //return dot.compile(tmp); 
                    return dot.compile(tmp);
                } catch (e) {
                    console.log("problem with phrase: [[" + item.phrase + "]]", e);
                    return false;
                }
            })
            .filter(function (item) {
                // remove the failed phrases, if any
                if (item) return true; else return false;
            })
            ;

            console.log("phrases", phrase.general);

    }

    // update existing letter with user data
    function updateLetter () {

        // data from input
        /*
        data.input.name  = $('input[name=name]').val();
        data.input.years = $('input[name=years]').val();
        data.input.project = $('input[name=project]').val();
        data.input.employeeNicknamePlural = $('input[name=companypeople]').val();
        data.input.company = $('input[name=company]').val();
        */

        data.input.name  = getValue('input[name=name]') || '<b>[Your name]</b>';
        data.input.years = getValue('input[name=years]') || '<b>[Years of experience]</b>';
        data.input.project = getValue('input[name=project]');
        data.input.employeeNicknamePlural = getValue('input[name=companypeople]') || '<b>[Employees]</b>';
        data.input.company = getValue('input[name=company]') || '<b>[Company]</b>';
 
        for (i = 0; i < members.length; i++ ) {
            curr = members[i];

            if (typeof tmpl[curr] === 'function') {
                console.log("+++" + tmpl[curr](data));
                data[curr] = tmpl[curr](data);
            } else {
                console.log('tmpl[curr]  is a ' + typeof tmpl[curr]);
            }
        }

        data.phrases = tmpl.phrases.map(function (phrase) {
            return (typeof phrase === 'function') ? phrase(data) : "";
        });

        console.log(data);
    }

    // run template func and return result
    function getLetter () {
        return letter(data);
    }

    function display (letterMarkup) {
        $('main').html(letterMarkup);
    }

    $('button[name=newLetter]').on('click', function (e) {
        checkAllValidity();
        randomizeLetter()
        updateLetter();
        display(getLetter());
    });

    $('input').on('keyup', function (e) {
        checkAllValidity();
        updateLetter();
        display(getLetter());
    });

    randomizeLetter();
});
