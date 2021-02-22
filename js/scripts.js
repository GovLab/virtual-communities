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

Vue.use(VueMeta);

new Vue({

  el: '#home-page',

  data() {

    return {
      indexData: [],
      filterData: [],
      selectedProjectType: null,
      apiURL: 'https://directus.thegovlab.com/virtual-communities',
    }
  },

  created: function created() {
    this.memberslug = window.location.pathname.split('/');
    this.fetchIndex();

  },
  methods: {

    fetchIndex() {

      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "virtual-communities",
        storage: window.localStorage
      });
 
      client.getItems(
        'case_study',
        {
          fields: ['*.*','featured_image.*']
        }
      ).then(data => {

        self.indexData = data.data;
        self.filterData = self.indexData;
      })
        .catch(error => console.error(error));
    },
    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    }

  }
});


