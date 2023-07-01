const searchInput = document.getElementById("search-input");
const apiKey = "AIzaSyA3ZNg-GPr1hlyS6waxBKNg0Dsr-oTbErI";
localStorage.setItem("api_Key", apiKey);

const container = document.getElementById("video-container");

//YouTube GET API:  https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=[query]&key=[YOUR_API_KEY]



async function fetchStats(videoId){ 
    const endpoint = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=statistics,contentDetails&id=${videoId}`;
    let response = await fetch(endpoint); 
    let result = await response.json();
    return result ;
 }



function getViews(n){
    if(n < 1000)
        return n ;

    if(n <= 999999){
        n /= 1000;
        n = parseInt(n);
        return n + "K" ;
    }
    return parseInt(n / 1000000).toFixed(1) + "M" ;
}



function formatDuration(duration) {
  if(!duration) return "NA" ;

  let str = duration.replace("PT", "");
  str = str.replace("H", ":");
  str = str.replace("M", ":");
  if(str == str.replace("S","")) {
    str += "00";
  }
  else
    str = str.replace("S", "");
  return str ;
}



function navigateToVideo(videoId){
  let path = `video.html`;
  if(videoId){

    document.cookie = `video_id=${videoId}; path=${path}`;
    let linkItem = document.createElement("a");
    linkItem.href = "http://127.0.0.1:5501/video.html"
    linkItem.target = "_blank";
    linkItem.click();
  }
  else {
    alert("Can't load the video: Watch it on YouTube")
  }
}



function showThumbNails(items) {
  container.innerHTML = "";
  // console.log('Thumbnail');
  // console.log(items);

  for (let i=0; i<items.length; i++) {
    let videoItem = items[i];
    let imageUrl = videoItem.snippet.thumbnails.high.url;
    let videoElement = document.createElement("div");

    videoElement.addEventListener("click", () => {
      navigateToVideo(videoItem.id.videoId);
    });

    let videoChildren = `
        <div class="visual"><img src="${imageUrl}"/>
        <b>${formatDuration(videoItem.duration)}</b></div>
        <div class="details"><p class="title">${videoItem.snippet.title}</p>
        <p class="channel-name">${videoItem.snippet.channelTitle}</p>
        <p class="view-count">${videoItem.videoStats ? getViews(videoItem.videoStats.viewCount) + "Views": "NA"}</p></div>
    `;
    videoElement.innerHTML = videoChildren ;
    container.append(videoElement);
  }
}



async function fetchVideos(query) {
  let apiEndPoint = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${query}&key=${apiKey}`;

  try {
      let response = await fetch(apiEndPoint);
      let result = await response.json();
      console.log(result);

      for(let i = 0; i<result.items.length; i++) {
        let video = result.items[i];
        // console.log(video);
          let videoStats = await fetchStats(video.id.videoId)
          if(videoStats.items.length > 0)
              result.items[i].videoStats = videoStats.items[0].statistics; 
          result.items[i].duration = videoStats.items[0] && videoStats.items[0].contentDetails.duration;
      }
      showThumbNails(result.items);
  }
  catch(error) {
      console.log("Something went wrong: " + error);
  }
}



function searchVideos() {
  let searchValue = searchInput.value;
  // Fetch videos from youtube API
  fetchVideos(searchValue);
}

searchVideos();