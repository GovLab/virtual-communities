////////////////////////////////////////
// reload page after Forward and back
///////////////////////////////////////

const TYPE_BACK_FORWARD = 2;

function isReloadedPage() {
  return performance.navigation.type === TYPE_BACK_FORWARD;
}

function main() {
  if (isReloadedPage()) {
    window.location.reload();
  }
}
main();

////////////////////////////////////////////////////////////
///// TEAM  API REQUEST ` `
////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////
///// PRE-RENDERED PAGES (see scripts/prerender.mjs)
////////////////////////////////////////////////////////////
// A pre-rendered page carries its Vue template and the CMS data inline:
// render from those instead of calling the API.
var PRERENDER = (function () {
  var tpl = document.getElementById('home-page-tpl');
  var json = document.getElementById('prerender-data');
  if (!tpl || !json) return null;
  try {
    return { template: '#home-page-tpl', data: JSON.parse(json.textContent).data };
  } catch (e) {
    return null;
  }
})();

Vue.use(VueMeta);

new Vue({
    
  el: '#home-page',
  template: PRERENDER ? PRERENDER.template : undefined,

  data () {

    return {
      indexData: PRERENDER ? PRERENDER.data.indexData : [],
      newData: [],
      apiURL: 'https://burnes-center.directus.app/virtual-communities',

    }
  },

  created: function created() {
    // Slug = last path segment, without query, hash, trailing slash or ".html".
    var parts = window.location.pathname.split('/').filter(Boolean);
    this.memberslug = decodeURIComponent((parts.pop() || '').replace(/\.html$/, ''));

    console.log(this.memberslug);

    if (!PRERENDER) this.fetchIndex();
  },
  methods: {

    fetchIndex() {
      const self = this;
      const url = `https://burnes-center.directus.app/items/vc_case_study?filter%5Bslug%5D=${encodeURIComponent(self.memberslug)}&fields%5B0%5D=%2A.%2A`;
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          self.indexData = data.data;
          console.log(self.indexData);
        })
        .catch(error => console.error(error));
    },
    hover(id){
      console.log(id);
      document.getElementById(id).classList.toggle("show");
      
      
    }
}
});


