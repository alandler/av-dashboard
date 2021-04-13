# av-dashboard

# TODO

### Metacontroller interface
##### Bugs
- [ ] Autosize the SVG based on size (BUGGY)
- [ x ] Autoplace nodes to avoid overlap (currently assuming users only need to see one leg of the tree at a time)
- [ x ] Add image representing cells of the intersection
- [ x ] Reduce labels to decision criteria. Leaves only to include action.
- [ x ] Fix collapse
- [ x ] Fix text updates

##### Features + Expert Interface
- [ ] If approached this way, when saving the expert, saves to the meta controller
- [x ] Right click menu --> Make node an expert
- [x ] Right click menu --> Build expert interface link
- [x ] Instead of including experts as entire trees, condense to single node in the meta controller interface (NOTE: Works with existing interface - more a user-defined thing)
- [x] Download dotfile

### Backend Database
- [ ] Login
- [ ] Metacontrollers saved per intersection
- [ ] Log Interface 

### Log Interface
- [ ] View/modify and Offline supervision options
- [ ] Expand option to include CCTV footage, the decision rule used, additional info
- [ ] decision_path Parser
- [x] Change "critical feature" to "reason"

### Map
- [x] Markers link to meta controller
