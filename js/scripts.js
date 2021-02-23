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
      reportData:[],
      aboutData:[],
      exec_summary:[],
      teamData:[],
      selectedProjectType: null,
      showMessage: true,
      index_active:0,
      apiURL: 'https://directus.thegovlab.com/virtual-communities',
    }
  },

  created: function created() {
    this.memberslug = window.location.pathname.split('/');
    this.fetchIndex();
    this.fetchReports();
    this.fetchSummary();
    this.fetchTeam();
    this.fetchAbout();
    this.toggleMessage();
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
    fetchAbout() {

      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "virtual-communities",
        storage: window.localStorage
      });
 
      client.getItems(
        'about',
        {
          fields: ['*.*']
        }
      ).then(data => {

        self.aboutData = data.data;
 
      })
        .catch(error => console.error(error));
    },
    fetchTeam() {

      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "virtual-communities",
        storage: window.localStorage
      });
 
      client.getItems(
        'team',
        {
          fields: ['*.*','headshot.*']
        }
      ).then(data => {
        data.data.sort(function(a, b) {
    
          var textA = a.last_name.toUpperCase();
          var textB = b.last_name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      
        
      });

        self.teamData = data.data;
     
      })
        .catch(error => console.error(error));
    },
    fetchSummary() {

      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "virtual-communities",
        storage: window.localStorage
      });
 
      client.getItems(
        'executive_summary',
        {
          fields: ['*.*']
        }
      ).then(data => {

        self.exec_summary = data.data;

      })
        .catch(error => console.error(error));
    },
    fetchReports() {

      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "virtual-communities",
        storage: window.localStorage
      });
 
      client.getItems(
        'reports',
        {
          fields: ['*.*']
        }
      ).then(data => {

        self.reportData = data.data;
      })
        .catch(error => console.error(error));
    },
    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    },
    toggleMessage (index) {
      this.index_active = index;
    	this.showMessage = !this.showMessage
    }
   

  }
});


