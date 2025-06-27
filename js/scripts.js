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
      apiURL: 'https://burnes-center.directus.app/virtual-communities',
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

    async fetchIndex() {
      try {
        const response = await fetch(
          "https://burnes-center.directus.app/items/vc_case_study?fields[0]=*.*&fields[1]=featured_image.*"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.indexData = data.data;
        this.filterData = this.indexData;
        console.log(this.indexData);
      } catch (error) {
        console.error(error);
      }
    },
    fetchAbout() {
      const self = this;
      fetch('https://burnes-center.directus.app/items/vc_about?fields%5B0%5D=%2A.%2A')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          self.aboutData = data.data;
          console.log(this.aboutData);
        })
        .catch(error => console.error(error));
    },
    fetchTeam() {
      const self = this;
      fetch('https://burnes-center.directus.app/items/vc_team?fields%5B0%5D=%2A.%2A&fields%5B1%5D=headshot.%2A')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Sort by last_name (case-insensitive)
          data.data.sort(function(a, b) {
            var textA = (a.last_name || '').toUpperCase();
            var textB = (b.last_name || '').toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          });
          self.teamData = data.data;
        })
        .catch(error => console.error(error));
    },
    fetchSummary() {
      const self = this;
      fetch('https://burnes-center.directus.app/items/vc_executive_summary?fields%5B0%5D=%2A.%2A')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          self.exec_summary = data.data;
        })
        .catch(error => console.error(error));
    },
    fetchReports() {
      const self = this;
      fetch('https://burnes-center.directus.app/items/vc_reports?fields%5B0%5D=%2A.%2A&fields%5B1%5D=thumbnail.%2A')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
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


