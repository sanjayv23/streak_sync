-- database to store tasks to be done
create table task(
	user_id varchar(25),
	task varchar(25),
	task_id uuid,
	date int,
	month int,
	year int
)

-- database to store completed task
create table complete_task(
	user_id varchar(25),
	task varchar(25),
	task_id uuid,
	date int,
	month int,
	year int
)
