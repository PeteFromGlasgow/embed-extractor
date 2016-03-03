var request = require("request");

var count = 0
var out = [];
function handleProperties (dataset, metadata){
	var jsonObject = {
		programme_name: metadata.entity.programme_name,
		project_name: metadata.entity.project_name,
		property_code: metadata.entity.property_code,
		property_type: (metadata.entity.property_data != null) ? metadata.entity.property_data.property_type : null,
		profiles: []
	}

	for (var i = 0; i < dataset.profiles.length; i++) {
			jsonObject.profiles.push({
			gross_internal_area: dataset.profiles[i].profile_data.gross_internal_area,
			ber: dataset.profiles[i].profile_data.ber,
			ter: dataset.profiles[i].profile_data.ter,
			event_type: dataset.profiles[i].profile_data.event_type,
			occupancy_total: dataset.profiles[i].profile_data.occupancy_total,
			total_volume: dataset.profiles[i].profile_data.total_volume,
			annual_heating_load: dataset.profiles[i].profile_data.annual_heating_load,
			total_rooms: dataset.profiles[i].profile_data.total_rooms
		});
	}

	out.push(jsonObject);
		
	count++;
	if (count == 422){
	    console.log(JSON.stringify(out));
	}
}


function handleEntities (entities, metadata){
	for (var j = 0; j < entities.length; j++) {
		metadata.entity = entities[j];
		handleProperties(entities[j], metadata)
	};
}

function handleProjects(projects, metadata){
	for (var i = 0; i < projects.length; i++) {
		request.get("http://www.getembed.com/4/projects/"+projects[i].project_id+"/entities", function(err, res) {
			var entities = JSON.parse(res.body).entities;
			metadata.project = projects[i];
			handleEntities(entities, metadata);
		})
	};
}


function handleProgrammes(programmes, metadata){
	for (var i = 0; i < programmes.length; i++) {
		request.get("http://www.getembed.com"+programmes[i].href+"/projects", function(err, res){
			metadata.program = programmes[i];
			handleProjects(JSON.parse(res.body), metadata);
		})
	};
    
}

request.get("http://www.getembed.com/4/programmes/", function(err, res){
	handleProgrammes(JSON.parse(res.body), {});
})